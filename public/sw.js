/**
 * Image cache service worker.
 *
 * Every icon (characters, weapons, materials, event covers) lives on a third-party CDN, and
 * several of them tell the browser not to keep it: static.nanoka.cc (WW, NTE) sends
 * max-age=120, api.encore.moe and stardive.7dso.xyz max-age=0. So each visit re-asks the
 * CDN about hundreds of icons before showing them.
 *
 * Strategy — cache first, revalidate in the background:
 *   - an image already in the cache is returned at once, without touching the network
 *   - if its copy is older than REVALIDATE_AFTER, it is fetched again in the background and
 *     overwritten only when it changed (ETag / Last-Modified); the next view shows the new one
 *   - a miss is fetched, shown, and stored
 * The app also posts `{ type: 'precache', urls, keep }` when a game is selected, so the whole
 * game's icon set is downloaded once up front (src/services/imageCache.js).
 *
 * CDNs that send CORS headers are stored as normal responses. The rest can only be fetched
 * `no-cors` (opaque); those are stored too, but cannot be checked for changes, so they are
 * simply replaced on revalidation.
 *
 * Bump VERSION to throw every stored image away.
 */

const VERSION = 'v1';
const IMAGE_CACHE = `img-${VERSION}`;
const META_CACHE = `img-meta-${VERSION}`;
const DAY = 24 * 60 * 60 * 1000;
const REVALIDATE_AFTER = 3 * DAY;
const PRUNE_AFTER = 30 * DAY; // unreferenced images older than this are dropped
const PRECACHE_CONCURRENCY = 6;

// Hosts that refused a CORS request. Remembered for the worker's lifetime so they are not
// asked twice per image.
const corslessHosts = new Set();
const inFlight = new Map();

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith('img-') && name !== IMAGE_CACHE && name !== META_CACHE)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

const isRemoteImage = (request) => {
  if (request.method !== 'GET' || request.destination !== 'image') return false;
  const url = new URL(request.url);
  return (url.protocol === 'https:' || url.protocol === 'http:') && url.origin !== self.location.origin;
};

const metaKey = (url) => `https://img-meta.invalid/?u=${encodeURIComponent(url)}`;

const storedAt = async (url) => {
  const meta = await caches.open(META_CACHE);
  const hit = await meta.match(metaKey(url));
  return hit ? Number(await hit.text()) || 0 : 0;
};

const touch = async (url) => {
  const meta = await caches.open(META_CACHE);
  await meta.put(metaKey(url), new Response(String(Date.now())));
};

/**
 * Fetch an image, CORS first so it can be stored as a readable response.
 * Throws only when the network fails both ways.
 */
const download = async (url, { refresh = false } = {}) => {
  const init = { credentials: 'omit', cache: refresh ? 'no-cache' : 'default', redirect: 'follow' };
  const host = new URL(url).host;
  if (!corslessHosts.has(host)) {
    try {
      return await fetch(url, { ...init, mode: 'cors' });
    } catch {
      corslessHosts.add(host);
    }
  }
  return fetch(url, { ...init, mode: 'no-cors' });
};

const storable = (response) => response && (response.ok || response.type === 'opaque');

const store = async (url, response) => {
  if (!storable(response)) return;
  try {
    const cache = await caches.open(IMAGE_CACHE);
    await cache.put(url, response);
    await touch(url);
  } catch {
    // Quota exceeded or similar — the image was still shown, it just isn't kept.
  }
};

// Same file as the stored copy? Only answerable for readable (CORS) responses.
const unchanged = (stored, fresh) => {
  if (stored.type === 'opaque' || fresh.type === 'opaque') return false;
  const etag = fresh.headers.get('etag');
  if (etag && etag === stored.headers.get('etag')) return true;
  const modified = fresh.headers.get('last-modified');
  return Boolean(modified && modified === stored.headers.get('last-modified'));
};

const once = (url, task) => {
  if (!inFlight.has(url)) {
    inFlight.set(url, task().finally(() => inFlight.delete(url)));
  }
  return inFlight.get(url);
};

const revalidate = (url, stored) => once(url, async () => {
  if (Date.now() - (await storedAt(url)) < REVALIDATE_AFTER) return;
  try {
    const fresh = await download(url, { refresh: true });
    if (!storable(fresh)) return; // CDN hiccup — keep the copy we have
    if (unchanged(stored, fresh)) await touch(url);
    else await store(url, fresh);
  } catch {
    // Offline — keep the copy we have.
  }
});

const respond = async (event) => {
  const { request } = event;
  const url = request.url;
  const cache = await caches.open(IMAGE_CACHE);
  const stored = await cache.match(url);

  // An opaque copy can't answer a CORS request; let the browser handle that one.
  if (stored && !(request.mode === 'cors' && stored.type === 'opaque')) {
    event.waitUntil(revalidate(url, stored.clone()));
    return stored;
  }

  try {
    const response = await download(url);
    event.waitUntil(store(url, response.clone()));
    return response;
  } catch {
    return fetch(request);
  }
};

self.addEventListener('fetch', (event) => {
  if (isRemoteImage(event.request)) event.respondWith(respond(event));
});

const prune = async (keep) => {
  const cache = await caches.open(IMAGE_CACHE);
  const meta = await caches.open(META_CACHE);
  for (const request of await cache.keys()) {
    if (keep.has(request.url)) continue;
    if (Date.now() - (await storedAt(request.url)) < PRUNE_AFTER) continue;
    await cache.delete(request);
    await meta.delete(metaKey(request.url));
  }
};

const precache = async (urls, keep) => {
  const cache = await caches.open(IMAGE_CACHE);
  const have = new Set((await cache.keys()).map((request) => request.url));
  const queue = [...new Set(urls)].filter((url) => !have.has(url));

  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const url = queue[next++];
      await once(url, async () => {
        try {
          await store(url, await download(url));
        } catch {
          // Unreachable now; it will be fetched when it is actually shown.
        }
      });
    }
  };
  await Promise.all(Array.from({ length: PRECACHE_CONCURRENCY }, worker));

  if (Array.isArray(keep)) await prune(new Set(keep));
};

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'precache' && Array.isArray(data.urls)) {
    event.waitUntil(precache(data.urls, data.keep));
  }
});
