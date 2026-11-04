import { reactive } from 'vue';
import { toast } from 'vue3-toastify';
import { getAllKeys } from '@/utils/storage';
import logger from '@/utils/logger';
import router from '@/router';
import * as drive from './googleDrive';

/**
 * Cloud Sync — mirrors every synced `gameplanner_*` localStorage key into one
 * JSON file in the user's Google Drive appDataFolder.
 *
 * localStorage stays the source the app reads and writes; nothing else in the
 * app knows sync exists. Change detection is a hash of the synced keys, polled
 * every few seconds — the stores write localStorage from many places, and
 * comparing a snapshot catches all of them without touching any of them.
 *
 * Two markers in the meta record decide every sync:
 *   syncedHash        — hash of the local data as of the last sync
 *   cloudModifiedTime — Drive's modifiedTime of the file as of the last sync
 * Local changed = hash differs; Drive changed = modifiedTime differs. Only one
 * side changed → copy it over. Both changed → conflict, resolved by the user,
 * never by guessing (see decideAction).
 */

// Not prefixed with `gameplanner_`, so it is never synced or backed up itself.
const META_KEY = 'cloudsync_meta';
const PAYLOAD_VERSION = 1;
const POLL_MS = 10_000;
const FOCUS_RECHECK_MS = 60_000;

// Per-device view state: syncing it would only make two devices fight.
const DEVICE_KEYS = new Set([
  'gameplanner_theme',
  'gameplanner_locale',
  'gameplanner_current_game',
  'gameplanner_timeline_prefs',
]);

export const syncState = reactive({
  connected: false,   // a Google account is linked on this device
  authorized: false,  // and we currently hold a valid access token
  user: null,         // { name, email, photo }
  status: 'idle',     // idle | syncing | conflict | error
  lastSyncedAt: null,
  error: '',
});

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested)
// ---------------------------------------------------------------------------

/** Synced keys → raw stored strings, keys sorted so the hash is stable. */
export function buildSnapshot(storage = localStorage, keys = getAllKeys()) {
  const snapshot = {};
  keys
    .filter((key) => !DEVICE_KEYS.has(key))
    .sort()
    .forEach((key) => {
      const value = storage.getItem(key);
      if (value !== null) snapshot[key] = value;
    });
  return snapshot;
}

/** cyrb53 — fast 53-bit string hash; collisions are irrelevant at this scale. */
export function hashString(str) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function hashSnapshot(snapshot) {
  const sorted = Object.keys(snapshot).sort().map((key) => [key, snapshot[key]]);
  return hashString(JSON.stringify(sorted));
}

/**
 * @param {{ cloudFile: object|null, meta: object|null, localHash: string, hasLocalData: boolean }} input
 * @returns {'none'|'upload'|'download'|'conflict'}
 */
export function decideAction({ cloudFile, meta, localHash, hasLocalData }) {
  if (!cloudFile) return hasLocalData ? 'upload' : 'none';

  // First sync on this device: an empty device just takes Drive's copy;
  // a device that already has data must not silently lose either side.
  if (!meta?.syncedHash) return hasLocalData ? 'conflict' : 'download';

  const localChanged = meta.syncedHash !== localHash;
  const cloudChanged = meta.cloudModifiedTime !== cloudFile.modifiedTime;

  if (localChanged && cloudChanged) return 'conflict';
  if (localChanged) return 'upload';
  if (cloudChanged) return 'download';
  return 'none';
}

/** Drive payload → snapshot, or null when the file is not ours / corrupt. */
export function parsePayload(payload) {
  if (!payload || typeof payload !== 'object' || typeof payload.data !== 'object' || !payload.data) {
    return null;
  }
  const snapshot = {};
  for (const [key, value] of Object.entries(payload.data)) {
    if (key.startsWith('gameplanner_') && !DEVICE_KEYS.has(key) && typeof value === 'string') {
      snapshot[key] = value;
    }
  }
  return snapshot;
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

function loadMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) || null;
  } catch {
    return null;
  }
}

function saveMeta(patch) {
  const next = { ...loadMeta(), ...patch };
  localStorage.setItem(META_KEY, JSON.stringify(next));
  syncState.lastSyncedAt = next.lastSyncedAt || null;
  return next;
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

let running = null;
let lastCheckAt = 0;
let pendingConflict = null; // { file, snapshot, updatedAt } while status === 'conflict'
let reconnectToastShown = false;

function applySnapshot(snapshot) {
  // Synced keys absent from Drive were deleted on the other device.
  buildSnapshotKeys().forEach((key) => {
    if (!(key in snapshot)) localStorage.removeItem(key);
  });
  Object.entries(snapshot).forEach(([key, value]) => localStorage.setItem(key, value));
}

function buildSnapshotKeys() {
  return Object.keys(buildSnapshot());
}

async function upload(fileId, snapshot) {
  const file = await drive.uploadFile(
    { version: PAYLOAD_VERSION, updatedAt: new Date().toISOString(), data: snapshot },
    fileId
  );
  saveMeta({
    fileId: file.id,
    syncedHash: hashSnapshot(snapshot),
    cloudModifiedTime: file.modifiedTime,
    lastSyncedAt: new Date().toISOString(),
  });
  logger.info('Cloud sync: uploaded');
}

/** Writes Drive's data locally and reloads, since every store hydrated at boot. */
function download(file, snapshot) {
  applySnapshot(snapshot);
  saveMeta({
    fileId: file.id,
    syncedHash: hashSnapshot(buildSnapshot()),
    cloudModifiedTime: file.modifiedTime,
    lastSyncedAt: new Date().toISOString(),
  });
  logger.info('Cloud sync: downloaded, reloading');
  window.location.reload();
}

async function fetchCloud(file) {
  const payload = await drive.downloadFile(file.id);
  const snapshot = parsePayload(payload);
  if (!snapshot) throw new Error('Sync file on Drive is unreadable');
  return { snapshot, updatedAt: payload.updatedAt || file.modifiedTime };
}

async function runSync() {
  const meta = loadMeta();
  const local = buildSnapshot();
  const localHash = hashSnapshot(local);
  const file = await drive.findSyncFile();
  lastCheckAt = Date.now();

  const action = decideAction({
    cloudFile: file,
    meta,
    localHash,
    hasLocalData: Object.keys(local).length > 0,
  });

  if (action === 'upload') return upload(file?.id ?? null, local);
  if (action === 'none') return;

  const cloud = await fetchCloud(file);

  if (action === 'download') return download(file, cloud.snapshot);

  // conflict — but identical content on both sides is no conflict at all
  if (hashSnapshot(cloud.snapshot) === localHash) {
    saveMeta({ fileId: file.id, syncedHash: localHash, cloudModifiedTime: file.modifiedTime, lastSyncedAt: new Date().toISOString() });
    return;
  }

  pendingConflict = { file, snapshot: cloud.snapshot, updatedAt: cloud.updatedAt };
  syncState.status = 'conflict';
  toast.warning('Sync conflict: this device and Google Drive both changed. Click to choose.', {
    autoClose: false,
    onClick: () => router.push('/settings'),
  });
}

function handleError(error) {
  if (error instanceof drive.DriveAuthError) {
    syncState.authorized = false;
    syncState.status = 'idle';
    promptReconnect();
    return;
  }
  logger.error('Cloud sync failed:', error);
  syncState.status = 'error';
  syncState.error = error.message;
}

/** Bring local and Drive in line. Concurrent callers share one run. */
export function syncNow() {
  if (running) return running;
  if (!syncState.authorized || syncState.status === 'conflict') return Promise.resolve();

  syncState.status = 'syncing';
  syncState.error = '';
  running = runSync()
    .then(() => {
      if (syncState.status === 'syncing') syncState.status = 'idle';
    })
    .catch(handleError)
    .finally(() => {
      running = null;
    });
  return running;
}

/** @param {'cloud'|'local'} keep */
export async function resolveConflict(keep) {
  if (!pendingConflict) return;
  const { file, snapshot } = pendingConflict;
  pendingConflict = null;
  syncState.status = 'syncing';
  try {
    if (keep === 'cloud') {
      download(file, snapshot);
    } else {
      await upload(file.id, buildSnapshot());
      syncState.status = 'idle';
    }
  } catch (error) {
    handleError(error);
  }
}

export function getConflictInfo() {
  return pendingConflict ? { cloudUpdatedAt: pendingConflict.updatedAt } : null;
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

function promptReconnect() {
  if (reconnectToastShown || !syncState.connected) return;
  reconnectToastShown = true;
  // A token refresh opens a popup, which only a click may do — so ask for one.
  toast.info('Google Drive sync paused. Click here to reconnect.', {
    autoClose: false,
    onClick: () => connect().catch(() => {}),
  });
}

/** Sign in (or back in) and sync. Call from a click handler. */
export async function connect() {
  const meta = loadMeta();
  await drive.requestToken(meta?.user?.email);
  reconnectToastShown = false;

  const user = await drive.getUser();
  const profile = { name: user?.displayName || '', email: user?.emailAddress || '', photo: user?.photoLink || '' };

  // A different Google account means a different Drive file: forget the old markers.
  const switchedAccount = meta?.user?.email && meta.user.email !== profile.email;
  if (switchedAccount) localStorage.removeItem(META_KEY);
  saveMeta({ user: profile });

  syncState.connected = true;
  syncState.authorized = true;
  syncState.user = profile;
  await syncNow();
}

/** Unlink this device. Local data and the Drive file are both left as they are. */
export async function disconnect() {
  await drive.revokeToken();
  localStorage.removeItem(META_KEY);
  pendingConflict = null;
  Object.assign(syncState, {
    connected: false, authorized: false, user: null, status: 'idle', lastSyncedAt: null, error: '',
  });
}

let initialized = false;

/** Called once at app start. Does nothing until the user has connected once. */
export function initCloudSync() {
  if (initialized) return;
  initialized = true;

  const meta = loadMeta();
  if (meta?.user) {
    syncState.connected = true;
    syncState.user = meta.user;
    syncState.lastSyncedAt = meta.lastSyncedAt || null;
    syncState.authorized = !!drive.getStoredToken();
    if (syncState.authorized) syncNow();
    else promptReconnect();
  }

  setInterval(() => {
    if (!syncState.authorized || syncState.status !== 'idle') return;
    if (!drive.getStoredToken()) {
      syncState.authorized = false;
      promptReconnect();
      return;
    }
    if (hashSnapshot(buildSnapshot()) !== loadMeta()?.syncedHash) syncNow();
  }, POLL_MS);

  // Coming back to the tab is when another device most likely wrote Drive.
  window.addEventListener('focus', () => {
    if (syncState.authorized && Date.now() - lastCheckAt > FOCUS_RECHECK_MS) syncNow();
  });
}

export default {
  syncState,
  initCloudSync,
  connect,
  disconnect,
  syncNow,
  resolveConflict,
  getConflictInfo,
};
