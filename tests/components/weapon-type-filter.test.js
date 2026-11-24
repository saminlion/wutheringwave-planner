import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

/**
 * The weapon-type filter compares the sheet's value (weapon.type / character.weapon) with the
 * config's `filters.weaponTypes[].value`. When the two spell a type differently (pistols vs
 * pistol, one_handed_sword vs sword, a missing mg) that type can't be filtered at all. This
 * renders both pages with every game's real data and picks each filter option.
 */
const { current } = vi.hoisted(() => ({ current: { game: null } }));

vi.mock('@/composables/useLocale', () => ({
  useLocale: () => ({ tUI: (k) => k, tWeapon: (_i, n) => n, tCharacter: (_i, n) => n, tMaterial: (_i, n) => n }),
}));
vi.mock('@/store/game', () => ({
  useGameStore: () => ({
    get currentGameId() { return current.game.id; },
    get currentGameConfig() { return current.game.config; },
    get currentGame() { return current.game; },
    get filters() { return current.game.config.filters; },
    get formFields() { return current.game.config.formFields; },
    getData: (t) => current.game.getData(t),
    getComponent: () => null,
  }),
}));
vi.mock('@/store/planner', () => ({
  usePlannerStore: () => ({ characterSettings: {}, weaponSettings: {}, goals: [] }),
}));

import { supportedGames, getGame } from '@/games';
import WeaponView from '@/views/WeaponView.vue';
import CharacterView from '@/views/CharacterView.vue';

/** Placeholder rows for unreleased items carry `unknown`; those are not meant to be filterable. */
const PLACEHOLDER = new Set(['unknown', '', null, undefined]);

const pick = async (wrapper, selectIndex, value) => {
  await wrapper.findAll('select')[selectIndex].setValue(value);
  await nextTick();
};

describe.each(supportedGames.map((g) => g.id))('%s — weapon-type filter with the real data', (gameId) => {
  const game = getGame(gameId);
  const options = (game.config.filters?.weaponTypes || []).map((o) => o.value).filter((v) => v !== 'all');

  it('every weapon type in weapon.json has a filter option, and each option shows exactly its weapons', async () => {
    current.game = game;
    const weapons = Object.values(game.getData('weapons') || {});
    const missing = [...new Set(weapons.map((w) => w.type).filter((t) => !PLACEHOLDER.has(t) && !options.includes(t)))];
    expect(missing, `weapon types with no filter option in ${gameId}/config.js`).toEqual([]);

    const w = mount(WeaponView);
    expect(w.findAll('.weapon-card')).toHaveLength(weapons.length);
    for (const type of options) {
      await pick(w, 0, type);
      expect(w.findAll('.weapon-card').length, `filter "${type}"`).toBe(weapons.filter((x) => x.type === type).length);
    }
  });

  it('every character weapon in character.json has a filter option', async () => {
    current.game = game;
    const characters = Object.values(game.getData('characters') || {});
    const slots = (c) => [c.weapon, c.weapon_type, c.weapon_type_ranged].filter((v) => !PLACEHOLDER.has(v) && v !== 'all');
    const missing = [...new Set(characters.flatMap(slots).filter((t) => !options.includes(t)))];
    expect(missing, `character weapons with no filter option in ${gameId}/config.js`).toEqual([]);

    const w = mount(CharacterView);
    const weaponSelect = w.findAll('select').findIndex((s) => s.findAll('option').some((o) => o.element.value === options[0]));
    for (const type of options) {
      await pick(w, weaponSelect, type);
      const expected = characters.filter((c) => slots(c).includes(type) || c.weapon === 'all' || c.weapon_type === 'all').length;
      expect(w.findAll('.character-card').length, `filter "${type}"`).toBe(expected);
    }
  });
});
