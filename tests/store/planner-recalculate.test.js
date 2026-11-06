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

// What the "current game data" resolves a goal to — swapped per test to mimic a sheet sync.
const game = {
  characters: { c1: { game_id: 'c1' } },
  weapons: { w1: { game_id: 'w1', rarity: 5 } },
  characterResult: {},
  weaponResult: {},
};

vi.mock('@/store/game', () => ({
  useGameStore: () => ({ currentGameId: 'testgame', getData: (type) => game[type] }),
}));
vi.mock('@/services/weaponHelper.js', () => ({
  getWeaponField: (id, field) => game.weapons[id]?.[field] ?? null,
}));
vi.mock('@/services/materialHelper/character', () => ({
  calculateCharacterMaterials: () => ({ ...game.characterResult }),
  calculateLevelMaterials: vi.fn(),
  calculateSkillMaterials: vi.fn(),
  calculatePassiveMaterials: vi.fn(),
}));
vi.mock('@/services/materialHelper/weapon', () => ({
  calculateWeaponMaterials: () => ({ ...game.weaponResult }),
}));

const { usePlannerStore } = await import('@/store/planner');

const save = (key, value) => localStorage.setItem(`gameplanner_${key}_testgame`, JSON.stringify(value));
const savedGoals = () => JSON.parse(localStorage.getItem('gameplanner_goals_testgame'));

describe('planner goals follow the current game data', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    game.characters = { c1: { game_id: 'c1' } };
    game.weapons = { w1: { game_id: 'w1', rarity: 5 } };
    save('character', { c1: { currentLevel: '1', targetLevel: '90' } });
    save('weapon', { w1: { currentLevel: '1', targetLevel: '90' } });
  });

  it('replaces a material saved under a placeholder id once the data is fixed', () => {
    save('goals', [
      { id: 'c1', type: 'character', isHidden: true, materials: { temp_mat: 4, null: 2 } },
      { id: 'w1', type: 'weapon', isHidden: false, materials: { old_onyx: 3 } },
    ]);
    game.characterResult = { real_mat: 4, boss_1: 2 };
    game.weaponResult = { new_onyx: 3 };

    const store = usePlannerStore();
    store.hydrate('testgame');

    expect(store.goals[0]).toMatchObject({ isHidden: true, materials: { real_mat: 4, boss_1: 2 } });
    expect(store.goals[1].materials).toEqual({ new_onyx: 3 });
    // written back, so the next load (and cloud sync) sees the fresh snapshot
    expect(savedGoals()[0].materials).toEqual({ real_mat: 4, boss_1: 2 });
  });

  it('leaves goals it cannot recompute exactly as saved', () => {
    save('goals', [
      { id: 'gone', type: 'character', materials: { a: 1 } },
      { id: 'w1', type: 'weapon', materials: { b: 1 } },
    ]);
    game.weapons = { w1: { game_id: 'w1' } }; // rarity missing → weapon calc would return {}

    const store = usePlannerStore();
    store.hydrate('testgame');

    expect(store.goals.map((g) => g.materials)).toEqual([{ a: 1 }, { b: 1 }]);
  });

  it('does not rewrite storage when nothing changed', () => {
    save('goals', [{ id: 'c1', type: 'character', materials: { m: 1 } }]);
    game.characterResult = { m: 1 };
    const setItem = vi.spyOn(localStorage, 'setItem');

    usePlannerStore().hydrate('testgame');

    expect(setItem).not.toHaveBeenCalledWith('gameplanner_goals_testgame', expect.anything());
    setItem.mockRestore();
  });
});
