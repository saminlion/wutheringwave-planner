import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { collectGameImageUrls } from '@/services/imageCache';
import { getEnabledGames } from '@/games';

describe('collectGameImageUrls', () => {
  const data = {
    characters: { a: { icon: 'https://cdn.example/a.png' }, b: { icon: '' } },
    weapons: { w: { icon: 'https://cdn.example/w.png' }, dup: { icon: 'https://cdn.example/a.png' } },
    materials: { common: { m1: { icon: 'https://cdn.example/m 1.png' }, m2: { icon: '/local.png' } } },
    events: [{ cover: 'https://cdn.example/cover.png' }],
  };
  const read = (gameId, type) => data[type];

  it('collects icons from characters, weapons and nested materials, deduplicated and normalised', () => {
    expect(collectGameImageUrls('x', { read }).sort()).toEqual([
      'https://cdn.example/a.png',
      'https://cdn.example/m%201.png',
      'https://cdn.example/w.png',
    ]);
  });

  it('adds event covers only when asked', () => {
    expect(collectGameImageUrls('x', { read, covers: true })).toContain('https://cdn.example/cover.png');
  });

  it.each(getEnabledGames().map(({ id }) => id))('%s: real data yields remote icons', (gameId) => {
    const urls = collectGameImageUrls(gameId);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every((u) => /^https?:\/\//.test(u))).toBe(true);
  });
});

// ── public/sw.js, run against in-memory Cache Storage and a mocked network ──

const SW_SOURCE = fs.readFileSync(path.resolve(__dirname, '../../public/sw.js'), 'utf8');

class FakeCache {
  constructor() { this.map = new Map(); }
  key(req) { return typeof req === 'string' ? req : req.url; }
  async match(req) { return this.map.get(this.key(req))?.clone(); }
  async put(req, res) { this.map.set(this.key(req), res); }
  async keys() { return [...this.map.keys()].map((url) => ({ url })); }
  async delete(req) { return this.map.delete(this.key(req)); }
}

const opaque = () => ({ type: 'opaque', ok: false, status: 0, headers: new Headers(), clone() { return opaque(); } });

const image = (body, headers = {}) => new Response(body, { status: 200, headers });

function loadWorker(network) {
  const stores = new Map();
  const caches = {
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new FakeCache());
      return stores.get(name);
    },
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  };
  const handlers = {};
  const self = {
    location: { origin: 'https://app.example' },
    addEventListener: (type, fn) => { handlers[type] = fn; },
    skipWaiting: () => {},
    clients: { claim: async () => {} },
  };
  const fetch = vi.fn(network);
  new Function('self', 'caches', 'fetch', SW_SOURCE)(self, caches, fetch);

  const request = (url) => ({ url, method: 'GET', destination: 'image', mode: 'no-cors' });
  const get = async (url) => {
    const pending = [];
    let response;
    handlers.fetch({
      request: request(url),
      respondWith: (p) => { response = p; },
      waitUntil: (p) => pending.push(p),
    });
    const result = await response;
    await Promise.all(pending);
    // waitUntil may register more work after the response settled
    await new Promise((r) => setTimeout(r, 0));
    await Promise.all(pending);
    return result;
  };
  const message = async (data) => {
    let done;
    handlers.message({ data, waitUntil: (p) => { done = p; } });
    await done;
  };
  const imageCache = () => stores.get('img-v1');
  const ageAll = async (ms) => {
    const meta = stores.get('img-meta-v1');
    for (const [key, res] of meta.map) meta.map.set(key, new Response(String(Number(await res.clone().text()) - ms)));
  };
  return { get, message, fetch, imageCache, ageAll, handlers };
}

const URL_A = 'https://cdn.example/a.png';
const DAY = 24 * 60 * 60 * 1000;

describe('image cache service worker', () => {
  let worker;
  let version;

  beforeEach(() => {
    version = 'v1';
    worker = loadWorker(async (url, init) => image(`img-${version}`, { etag: `"${version}"` }));
  });

  it('a miss goes to the network and is stored; the next view never touches the network', async () => {
    expect(await (await worker.get(URL_A)).text()).toBe('img-v1');
    expect(worker.fetch).toHaveBeenCalledTimes(1);

    expect(await (await worker.get(URL_A)).text()).toBe('img-v1');
    expect(worker.fetch).toHaveBeenCalledTimes(1);
  });

  it('a stale copy is still served at once, refreshed in the background, overwritten only if changed', async () => {
    await worker.get(URL_A);
    await worker.ageAll(4 * DAY);

    // unchanged on the CDN: one revalidation request, stored copy kept
    expect(await (await worker.get(URL_A)).text()).toBe('img-v1');
    expect(worker.fetch).toHaveBeenCalledTimes(2);
    expect(worker.fetch.mock.calls[1][1].cache).toBe('no-cache');

    // changed on the CDN: old copy shown this time, new one stored for the next view
    await worker.ageAll(4 * DAY);
    version = 'v2';
    expect(await (await worker.get(URL_A)).text()).toBe('img-v1');
    expect(await (await worker.get(URL_A)).text()).toBe('img-v2');
  });

  it('a CDN without CORS falls back to no-cors and is stored opaque', async () => {
    worker = loadWorker(async (url, init) => {
      if (init.mode === 'cors') throw new TypeError('CORS');
      return opaque();
    });
    expect((await worker.get(URL_A)).type).toBe('opaque');
    expect(worker.imageCache().map.has(URL_A)).toBe(true);
  });

  it('does not store error responses', async () => {
    worker = loadWorker(async () => new Response('nope', { status: 404 }));
    await worker.get(URL_A);
    expect(worker.imageCache()?.map.has(URL_A) ?? false).toBe(false);
  });

  it('ignores same-origin and non-image requests', () => {
    const respondWith = vi.fn();
    worker.handlers.fetch({ request: { url: 'https://app.example/x.png', method: 'GET', destination: 'image' }, respondWith });
    worker.handlers.fetch({ request: { url: URL_A, method: 'GET', destination: 'script' }, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
  });

  it('precache downloads only what is missing, and prunes old unreferenced images', async () => {
    const URL_B = 'https://cdn.example/b.png';
    const OLD = 'https://cdn.example/old.png';
    await worker.get(URL_A);
    await worker.get(OLD);
    await worker.ageAll(40 * DAY);
    worker.fetch.mockClear();

    await worker.message({ type: 'precache', urls: [URL_A, URL_B], keep: [URL_A, URL_B] });

    expect(worker.fetch.mock.calls.map(([url]) => url)).toEqual([URL_B]);
    expect([...worker.imageCache().map.keys()].sort()).toEqual([URL_A, URL_B]);
  });
});
