import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Node 25's own global localStorage shadows happy-dom's and does not work without a file.
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

const { useGameStore } = await import('@/store/game');
const { getEnabledGames } = await import('@/games');

const allIds = () => getEnabledGames().map((g) => g.id);

describe('game visibility', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('shows every enabled game by default', () => {
    expect(useGameStore().visibleGames.map((g) => g.id)).toEqual(allIds());
  });

  it('hides a game from the tabs and remembers it', () => {
    const store = useGameStore();
    expect(store.setGameHidden('gfl2', true)).toBe(true);
    expect(store.visibleGames.map((g) => g.id)).not.toContain('gfl2');
    expect(JSON.parse(localStorage.getItem('gameplanner_hidden_games'))).toEqual(['gfl2']);

    store.setGameHidden('gfl2', false);
    expect(store.visibleGames.map((g) => g.id)).toContain('gfl2');
  });

  it('refuses to hide the last visible game', () => {
    const store = useGameStore();
    const [keep, ...rest] = allIds();
    rest.forEach((id) => store.setGameHidden(id, true));

    expect(store.setGameHidden(keep, true)).toBe(false);
    expect(store.visibleGames.map((g) => g.id)).toEqual([keep]);
  });

  it('never opens on a hidden game (e.g. hidden on another device)', () => {
    localStorage.setItem('gameplanner_current_game', JSON.stringify('nte'));
    localStorage.setItem('gameplanner_hidden_games', JSON.stringify(['nte']));
    const store = useGameStore();
    expect(store.currentGameId).not.toBe('nte');
    expect(store.currentGameId).toBe(store.visibleGames[0].id);
  });
});
