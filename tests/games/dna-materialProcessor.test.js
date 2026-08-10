import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMaterial, SUPPORTED_KEYS } from '@/games/dna/materialProcessor';
import { findMaterial } from '@/services/materialHelper/dbUtils';
import costs from '@/games/dna/data/costs.json';
import characters from '@/games/dna/data/character.json';
import weapons from '@/games/dna/data/weapon.json';
import materials from '@/games/dna/data/materials.json';

vi.mock('@/services/materialHelper/dbUtils', () => ({
  // Returns a game_id that encodes the lookup so assertions can read it back
  findMaterial: vi.fn((category, identifier, tier, useId) =>
    useId ? { game_id: `id:${category}:${identifier}` } : { game_id: `${category}/${identifier}/T${tier}` },
  ),
  getMaterialField: vi.fn((m, f) => m?.[f] ?? null),
}));

vi.mock('@/utils/logger', () => ({
  default: { debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const OUTSIDER = {
  display_name: 'Outsider',
  common: 'teardrop',
  forgery: 'sacred',
  ascension: 'bough',
  talent: 'gleaming',
  weeklyBoss: 9150010003,
};

const WEAPON = { display_name: 'Aureate Yore', common: 'teardrop', component_a: 'blade', component_b: 'decoration' };

beforeEach(() => {
  findMaterial.mockClear();
});

describe('DNA materialProcessor', () => {
  it('supports every key used by costs.json', () => {
    const usedKeys = new Set();
    const collect = (table) => {
      for (const entry of Object.values(table || {})) {
        for (const key of Object.keys(entry)) usedKeys.add(key);
      }
    };
    collect(costs.character.level);
    collect(costs.character.skill);
    collect(costs.character.passive);
    collect(costs.weapon.level_5);

    // credit / player_exp / weapon_exp are handled by the shared core processor
    const shared = new Set(['credit', 'player_exp', 'weapon_exp']);
    const unhandled = [...usedKeys].filter(k => !shared.has(k) && !SUPPORTED_KEYS.includes(k));
    expect(unhandled).toEqual([]);
  });

  it('resolves a tiered key through the character SubCategory', () => {
    const acc = {};
    expect(processMaterial(acc, 'common', [10, 1], OUTSIDER)).toBe(true);
    expect(acc).toEqual({ 'common/teardrop/T1': 10 });
  });

  it('resolves ascension as a SubCategory, not a game_id', () => {
    const acc = {};
    processMaterial(acc, 'ascension', [25, 3], OUTSIDER);
    expect(acc).toEqual({ 'ascension/bough/T3': 25 });
    expect(findMaterial).toHaveBeenCalledWith('ascension', 'bough', 3);
  });

  it('handles two tiers of one category in a single cost entry', () => {
    const acc = {};
    processMaterial(acc, 'common', [[3, 1], [1, 2]], OUTSIDER);
    expect(acc).toEqual({ 'common/teardrop/T1': 3, 'common/teardrop/T2': 1 });
  });

  it('accumulates repeated keys instead of overwriting', () => {
    const acc = {};
    processMaterial(acc, 'common', [3, 1], OUTSIDER);
    processMaterial(acc, 'common', [6, 1], OUTSIDER);
    expect(acc).toEqual({ 'common/teardrop/T1': 9 });
  });

  it('resolves talent through the per-character talent group', () => {
    const acc = {};
    processMaterial(acc, 'talent', [5, 3], OUTSIDER);
    expect(acc).toEqual({ 'talent/gleaming/T3': 5 });
  });

  it('resolves fixed-SubCategory keys without character data', () => {
    const acc = {};
    processMaterial(acc, 'forgery_luno', 150, OUTSIDER);
    processMaterial(acc, 'event', 1, OUTSIDER);
    expect(acc['forgery/luno/Tnull']).toBe(150);
    expect(acc['event/twilight/Tnull']).toBe(1);
  });

  it('resolves weeklyBoss by game_id from the character', () => {
    const acc = {};
    processMaterial(acc, 'weeklyBoss', 2, OUTSIDER);
    expect(acc).toEqual({ 'id:weeklyBoss:9150010003': 2 });
    expect(findMaterial).toHaveBeenCalledWith('weeklyBoss', 9150010003, null, true);
  });

  it('resolves the two weapon component slots separately', () => {
    const acc = {};
    processMaterial(acc, 'weapon_component_a', [20, 3], WEAPON);
    processMaterial(acc, 'weapon_component_b', [8, 3], WEAPON);
    expect(acc).toEqual({
      'weapon_component/blade/T3': 20,
      'weapon_component/decoration/T3': 8,
    });
  });

  it('declines shared keys so core.js can handle them', () => {
    const acc = {};
    expect(processMaterial(acc, 'credit', 5200, OUTSIDER)).toBe(false);
    expect(processMaterial(acc, 'player_exp', 57, OUTSIDER)).toBe(false);
    expect(acc).toEqual({});
  });

  it('does not throw when the character is missing a SubCategory field', () => {
    const acc = {};
    expect(processMaterial(acc, 'talent', [3, 1], { display_name: 'Nobody' })).toBe(true);
    expect(acc).toEqual({});
  });
});

describe('DNA data integrity', () => {
  it('gives every character the fields its costs need', () => {
    for (const [key, char] of Object.entries(characters)) {
      expect(char.common, `${key}.common`).toBeTruthy();
      expect(char.forgery, `${key}.forgery`).toBeTruthy();
      expect(char.ascension, `${key}.ascension`).toBeTruthy();
      expect(char.talent, `${key}.talent`).toBeTruthy();
      expect(char.weeklyBoss, `${key}.weeklyBoss`).toBeTruthy();
      expect(char.weapon_type, `${key}.weapon_type`).toBeTruthy();
      expect(char.weapon_type_ranged, `${key}.weapon_type_ranged`).toBeTruthy();
    }
  });

  it('gives every weapon both component slots', () => {
    for (const [key, weapon] of Object.entries(weapons)) {
      expect(weapon.common, `${key}.common`).toBeTruthy();
      expect(weapon.component_a, `${key}.component_a`).toBeTruthy();
      expect(weapon.component_b, `${key}.component_b`).toBeTruthy();
    }
  });

  it('points every character SubCategory at a material that exists', () => {
    const subCategoriesOf = (category) =>
      new Set(Object.values(materials[category] || {}).map(m => m.SubCategory));

    for (const [key, char] of Object.entries(characters)) {
      expect(subCategoriesOf('common'), `${key}.common`).toContain(char.common);
      expect(subCategoriesOf('forgery'), `${key}.forgery`).toContain(char.forgery);
      expect(subCategoriesOf('ascension'), `${key}.ascension`).toContain(char.ascension);
      expect(subCategoriesOf('talent'), `${key}.talent`).toContain(char.talent);
    }
    const bossIds = new Set(Object.values(materials.weeklyBoss).map(m => m.game_id));
    for (const [key, char] of Object.entries(characters)) {
      expect(bossIds, `${key}.weeklyBoss`).toContain(char.weeklyBoss);
    }
  });

  it('gives every EXP item a usable value', () => {
    for (const category of ['player_exp', 'weapon_exp']) {
      for (const [key, item] of Object.entries(materials[category])) {
        expect(typeof item.value, `${category}.${key}`).toBe('number');
        expect(item.value, `${category}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  /**
   * Totals cross-checked two ways: extracted from the Fandom Lua modules, and
   * against a community writeup whose per-character figures (1,464 Luno,
   * 23 weekly boss, 8 Twilight Tread) match these tables exactly. Locking them
   * down here so a bad sheet edit or a typo in costs.json fails loudly.
   */
  const sumCosts = (table, entity) => {
    const acc = {};
    for (const entry of Object.values(table)) {
      for (const [key, value] of Object.entries(entry)) {
        const pairs = Array.isArray(value) ? (Array.isArray(value[0]) ? value : [value]) : null;
        if (pairs) {
          for (const [qty, tier] of pairs) {
            const slot = `${key}_T${tier}`;
            acc[slot] = (acc[slot] || 0) + qty;
          }
        } else {
          acc[key] = (acc[key] || 0) + value;
        }
      }
    }
    return acc;
  };

  it('matches the verified character ascension + EXP totals (Lv1 → 70A)', () => {
    expect(sumCosts(costs.character.level, OUTSIDER)).toEqual({
      player_exp: 1692,
      common_T1: 10,
      common_T2: 155,
      ascension_T1: 5,
      ascension_T2: 22,
      ascension_T3: 43,
      // 169,200 EXP coin + 391,200 ascension coin
      credit: 560400,
    });
  });

  it('matches the verified per-skill totals (Lv1 → 10, one skill)', () => {
    expect(sumCosts(costs.character.skill, OUTSIDER)).toEqual({
      common_T1: 63,
      common_T2: 21,
      // 4+6+8+10+10 farmed, then 150+300 crafted into forgery T2 at Lv9/Lv10
      forgery_luno: 488,
      forgery_T1: 14,
      weeklyBoss: 6,
      event: 2,
      // Uses the wiki's 170,000 for Lv9→10; a community writeup says 90,000.
      // The wiki's own progression (30k→47k→90k→170k) is the tiebreaker, but
      // this is the one figure still worth confirming in game.
      credit: 360500,
    });
  });

  it('matches the verified talent/passive unlock totals (all six)', () => {
    expect(sumCosts(costs.character.passive, OUTSIDER)).toEqual({
      talent_T1: 3,
      talent_T2: 11,
      talent_T3: 10,
      weeklyBoss: 5,
      event: 2,
      credit: 330000,
    });
  });

  // Asserts the whole table, which runs to 70A. The level dropdown stops at 60A
  // because the 60→70 EXP band is unmeasured — hence weapon_exp only reaching 508.
  it('matches the verified weapon totals (full table, Lv1 → 70A)', () => {
    expect(sumCosts(costs.weapon.level_5, WEAPON)).toEqual({
      weapon_exp: 508,
      common_T1: 6,
      common_T2: 93,
      weapon_component_a_T1: 6,
      weapon_component_a_T2: 3,
      weapon_component_a_T3: 36,
      weapon_component_b_T1: 2,
      weapon_component_b_T2: 1,
      weapon_component_b_T3: 14,
      // 50,800 EXP coin + 261,800 ascension coin (six ascensions incl. 70A)
      credit: 312600,
    });
  });

  it('needs 23 weekly boss rings and 8 Twilight Treads for one full character', () => {
    const skill = sumCosts(costs.character.skill, OUTSIDER);
    const unlock = sumCosts(costs.character.passive, OUTSIDER);
    expect(skill.weeklyBoss * 3 + unlock.weeklyBoss).toBe(23);
    expect(skill.event * 3 + unlock.event).toBe(8);
  });

  it('keeps every tier referenced by costs.json in materials.json', () => {
    const tiersOf = (category, subCategory) =>
      new Set(
        Object.values(materials[category] || {})
          .filter(m => m.SubCategory === subCategory)
          .map(m => m.tier),
      );

    const CATEGORY_OF = {
      common: 'common',
      forgery: 'forgery',
      ascension: 'ascension',
      talent: 'talent',
      weapon_component_a: 'weapon_component',
      weapon_component_b: 'weapon_component',
    };

    const check = (table, entity) => {
      for (const entry of Object.values(table)) {
        for (const [key, value] of Object.entries(entry)) {
          const category = CATEGORY_OF[key];
          if (!category) continue;
          const field = key.startsWith('weapon_component_') ? key.replace('weapon_', '') : key;
          const subCategory = entity[field];
          const pairs = Array.isArray(value[0]) ? value : [value];
          for (const [, tier] of pairs) {
            expect(tiersOf(category, subCategory), `${key} T${tier}`).toContain(tier);
          }
        }
      }
    };

    check(costs.character.level, OUTSIDER);
    check(costs.character.skill, OUTSIDER);
    check(costs.character.passive, OUTSIDER);
    check(costs.weapon.level_5, WEAPON);
  });
});
