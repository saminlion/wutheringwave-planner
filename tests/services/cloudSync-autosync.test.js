import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';

// Node 25 ships its own (file-less, non-functional) global localStorage that
// shadows happy-dom's, so give the module a real in-memory Storage.
class MemoryStorage {
  #map = new Map();
  get length() { return this.#map.size; }
  key(i) { return [...this.#map.keys()][i] ?? null; }
  getItem(k) { return this.#map.has(k) ? this.#map.get(k) : null; }
  setItem(k, v) { this.#map.set(k, String(v)); }
  removeItem(k) { this.#map.delete(k); }
  clear() { this.#map.clear(); }
}
vi.stubGlobal('localStorage', new MemoryStorage());

vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('vue3-toastify', () => ({ toast: Object.assign(vi.fn(), { info: vi.fn(), error: vi.fn(), warning: vi.fn() }) }));

const drive = vi.hoisted(() => ({
  findSyncFile: vi.fn(),
  uploadFile: vi.fn(),
  downloadFile: vi.fn(),
  DriveAuthError: class extends Error {},
}));
vi.mock('@/services/googleDrive', () => drive);

const { syncState, tick, buildSnapshot, hashSnapshot } = await import('@/services/cloudSync');

/** A device that is linked and fully in sync with Drive file `f` at time t1. */
function linkedAndSynced() {
  localStorage.clear();
  localStorage.setItem('gameplanner_inventory_ww', '{"a":1}');
  localStorage.setItem('cloudsync_meta', JSON.stringify({
    user: { email: 'me@example.com' },
    fileId: 'f',
    syncedHash: hashSnapshot(buildSnapshot()),
    cloudModifiedTime: 't1',
  }));
  Object.assign(syncState, { connected: true, authorized: true, status: 'idle', pending: false, error: '' });
  drive.findSyncFile.mockResolvedValue({ id: 'f', modifiedTime: 't1' });
  drive.uploadFile.mockResolvedValue({ id: 'f', modifiedTime: 't2' });
}

describe('auto-sync on edit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkedAndSynced();
  });

  it('does nothing while local data matches the last sync', async () => {
    tick();
    tick();
    await flushPromises();
    expect(syncState.pending).toBe(false);
    expect(drive.uploadFile).not.toHaveBeenCalled();
  });

  it('flags the edit at once, then uploads it once it holds still', async () => {
    localStorage.setItem('gameplanner_inventory_ww', '{"a":5}');

    tick(); // first sight of the edit
    await flushPromises();
    expect(syncState.pending).toBe(true);
    expect(drive.uploadFile).not.toHaveBeenCalled();

    tick(); // unchanged since last tick → upload
    await flushPromises();
    expect(drive.uploadFile).toHaveBeenCalledTimes(1);
    const [payload, fileId] = drive.uploadFile.mock.calls[0];
    expect(fileId).toBe('f');
    expect(payload.data.gameplanner_inventory_ww).toBe('{"a":5}');
    expect(syncState.pending).toBe(false);
    expect(syncState.status).toBe('idle');
  });

  it('turns a burst of edits into a single upload', async () => {
    for (const n of [2, 3, 4]) {
      localStorage.setItem('gameplanner_inventory_ww', `{"a":${n}}`);
      tick();
      await flushPromises();
    }
    expect(drive.uploadFile).not.toHaveBeenCalled();

    tick();
    await flushPromises();
    expect(drive.uploadFile).toHaveBeenCalledTimes(1);
    expect(drive.uploadFile.mock.calls[0][0].data.gameplanner_inventory_ww).toBe('{"a":4}');
  });

  it('does not upload device-only keys like the theme', async () => {
    localStorage.setItem('gameplanner_theme', '"dark"');
    tick();
    tick();
    await flushPromises();
    expect(syncState.pending).toBe(false);
    expect(drive.uploadFile).not.toHaveBeenCalled();
  });
});
