import { watch } from 'vue';
import { getEnabledGames, getGameData } from '@/games';
import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

/**
 * Client side of the image cache (public/sw.js).
 *
 * The service worker serves every remote image from its cache once it has seen it. This
 * module registers it and, whenever a game is selected, hands it that game's whole icon
 * set so it is downloaded once in the background instead of page by page.
 */

const ICON_TYPES = ['characters', 'weapons', 'materials'];

const normalise = (value) => {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return null;
  try {
    return new URL(value).href; // same spelling the worker's cache keys use
  } catch {
    return null;
  }
};

/**
 * Every remote image a game's data points at.
 * Icons of characters, weapons and materials (nested by category); event covers on request —
 * they are large and mostly seen once, so they are kept but not downloaded ahead.
 *
 * @param {string} gameId
 * @param {{ covers?: boolean, read?: (gameId: string, type: string) => any }} [options]
 * @returns {string[]}
 */
export function collectGameImageUrls(gameId, { covers = false, read = getGameData } = {}) {
  const urls = new Set();
  const add = (value) => {
    const url = normalise(value);
    if (url) urls.add(url);
  };

  for (const type of ICON_TYPES) {
    const data = read(gameId, type) || {};
    for (const entry of Object.values(data)) {
      if (!entry || typeof entry !== 'object') continue;
      if ('icon' in entry) add(entry.icon);
      else Object.values(entry).forEach((item) => add(item?.icon)); // materials: category → items
    }
  }

  if (covers) {
    const events = read(gameId, 'events');
    if (Array.isArray(events)) events.forEach((event) => add(event?.cover));
  }

  return [...urls];
}

const precacheGame = async (gameId) => {
  if (!gameId || navigator.connection?.saveData) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    // Everything any game still references, so the worker only prunes images nothing uses.
    const keep = getEnabledGames().flatMap(({ id }) => collectGameImageUrls(id, { covers: true }));
    const urls = collectGameImageUrls(gameId);
    registration.active?.postMessage({ type: 'precache', urls, keep });
    logger.debug(`Image precache requested for ${gameId}: ${urls.length} images`);
  } catch (error) {
    logger.warn('Image precache failed', error);
  }
};

/**
 * Register the worker (production builds only — the dev server's HMR and a caching worker
 * don't mix) and precache the current game, again on every game switch.
 */
export function initImageCache() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('/sw.js').catch((error) => {
    logger.warn('Image cache worker registration failed', error);
  });

  const gameStore = useGameStore();
  watch(() => gameStore.currentGameId, (gameId) => {
    // Let the page's own images go first; the bulk download can wait.
    const start = () => precacheGame(gameId);
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 5000 });
    else setTimeout(start, 2000);
  }, { immediate: true });
}

export default initImageCache;
