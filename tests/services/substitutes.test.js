import { describe, it, expect } from 'vitest';
import {
  allocateSubstitutes, getSubstitutes, ownsSubstitute, partNeedsOf, scopeAllows,
} from '@/services/materialHelper/substitutes';
import { planBoxOpening } from '@/services/materialHelper/boxPlan';
import { transformBoxes, materialGroupExpander } from '../../scripts/lib/boxes.js';

// contents: [[materialId, cost, scope?], ...]
const sub = (id, contents) => ({
  game_id: id,
  type: 'substitute',
  contents: contents.map(([gid, cost = 1, scope]) => (scope ? { game_id: gid, cost, scope } : { game_id: gid, cost })),
});

describe('allocateSubstitutes', () => {
  it('fills what is still short and says how many substitutes it spends', () => {
    const plan = allocateSubstitutes({ 1: 3 }, [sub(900, [[1], [2]])], { 900: 5 });

    expect(plan.uses).toEqual([{ substituteId: '900', materialId: '1', count: 3, covers: 3 }]);
    expect(plan.used).toEqual({ 900: 3 });
    expect(plan.covered).toEqual({ 1: 3 });
    expect(plan.remaining).toEqual({});
    expect(plan.resolved).toEqual(['1']);
  });

  it('cost is substitutes per missing material, and limits what an owned stack covers', () => {
    // T2 costs 3 cores each: 2 missing → 6 cores. With 7 cores, only 2 of 3 are covered.
    const plan = allocateSubstitutes({ 1: 3 }, [sub(900, [[1, 3]])], { 900: 7 });

    expect(plan.used).toEqual({ 900: 6 });
    expect(plan.covered).toEqual({ 1: 2 });
    expect(plan.remaining).toEqual({ 1: 1 });
  });

  it('fractional cost rounds the substitutes spent up', () => {
    const plan = allocateSubstitutes({ 1: 3 }, [sub(900, [[1, 0.5]])], { 900: 10 });
    expect(plan.used).toEqual({ 900: 2 });
    expect(plan.covered).toEqual({ 1: 3 });
  });

  it('not enough substitutes: covers the smallest shortages first, leaves the rest short', () => {
    const plan = allocateSubstitutes({ 1: 5, 2: 2 }, [sub(900, [[1], [2]])], { 900: 3 });

    expect(plan.covered).toEqual({ 2: 2, 1: 1 });
    expect(plan.resolved).toEqual(['2']);
    expect(plan.remaining).toEqual({ 1: 4 });
  });

  it('spends the narrow substitute before the broad one', () => {
    const narrow = sub(901, [[1]]);
    const broad = sub(902, [[1], [2], [3]]);
    const plan = allocateSubstitutes({ 1: 2, 2: 2 }, [broad, narrow], { 901: 2, 902: 2 });

    expect(plan.used).toEqual({ 901: 2, 902: 2 });
    expect(plan.remaining).toEqual({});
  });

  it('ignores materials no substitute covers, and substitutes not owned', () => {
    const plan = allocateSubstitutes({ 1: 2, 5: 4 }, [sub(900, [[1]])], {});

    expect(plan.uses).toEqual([]);
    expect(plan.remaining).toEqual({ 1: 2, 5: 4 });
  });

  describe('scope', () => {
    const core = sub(900, [[1, 1, ['skill', 'weapon']]]);

    it('only covers the parts in scope', () => {
      // Need 5 for level + 4 for skill, own 0 → only the skill 4 can be covered.
      const partNeeds = partNeedsOf({ 'character.level': { 1: 5 }, 'character.skill': { 1: 4 } });
      const plan = allocateSubstitutes({ 1: 9 }, [core], { 900: 99 }, partNeeds);

      expect(plan.covered).toEqual({ 1: 4 });
      expect(plan.remaining).toEqual({ 1: 5 });
    });

    it('owned stock goes to the parts substitutes cannot serve first', () => {
      // Need 5 level + 4 skill, own 5 → stock pays for the level, cores fill the skill 4.
      const partNeeds = partNeedsOf({ 'character.level': { 1: 5 }, 'character.skill': { 1: 4 } });
      const plan = allocateSubstitutes({ 1: 4 }, [core], { 900: 99 }, partNeeds);

      expect(plan.covered).toEqual({ 1: 4 });
      expect(plan.remaining).toEqual({});
    });

    it('a scoped substitute cannot cover a shortage of unknown origin', () => {
      const plan = allocateSubstitutes({ 1: 2 }, [core], { 900: 99 });
      expect(plan.uses).toEqual([]);
    });

    it('an unscoped substitute covers any part, known or not', () => {
      const plan = allocateSubstitutes({ 1: 2 }, [sub(900, [[1]])], { 900: 99 });
      expect(plan.covered).toEqual({ 1: 2 });
    });

    it('two substitutes with different scopes never cover more than their own parts', () => {
      const skillOnly = sub(901, [[1, 1, ['skill']]]);
      const skillToo = sub(902, [[1, 1, ['skill']]]);
      const partNeeds = partNeedsOf({ 'character.level': { 1: 3 }, 'character.skill': { 1: 5 } });
      const plan = allocateSubstitutes({ 1: 8 }, [skillOnly, skillToo], { 901: 3, 902: 9 }, partNeeds);

      expect(plan.covered).toEqual({ 1: 5 });
      expect(plan.remaining).toEqual({ 1: 3 });
    });

    it('scope tokens match the whole part, the goal type or the part name', () => {
      expect(scopeAllows(['skill'], 'character.skill')).toBe(true);
      expect(scopeAllows(['skill'], 'character.level')).toBe(false);
      expect(scopeAllows(['weapon'], 'weapon.level')).toBe(true);
      expect(scopeAllows(['level'], 'weapon.level')).toBe(true);
      expect(scopeAllows(['character.passive'], 'character.passive')).toBe(true);
      expect(scopeAllows(null, 'character.level')).toBe(true);
      expect(scopeAllows(null, '')).toBe(true);
      expect(scopeAllows(['skill'], '')).toBe(false);
    });
  });

  it('partNeedsOf sums several goals and skips the processed marker', () => {
    expect(partNeedsOf(
      { 'character.skill': { 1: 2, processed: true } },
      { 'character.skill': { 1: 3 }, 'weapon.level': { 1: 1 } },
    )).toEqual({ 1: { 'character.skill': 5, 'weapon.level': 1 } });
  });

  it('getSubstitutes / ownsSubstitute pick only substitute entries', () => {
    const boxes = {
      900: sub(900, [[1]]),
      901: { game_id: 901, type: 'fixed', contents: [{ game_id: 1, qty: 1 }] },
    };
    expect(getSubstitutes(boxes).map((b) => b.game_id)).toEqual([900]);
    expect(ownsSubstitute(getSubstitutes(boxes), { 901: 3 })).toBe(false);
    expect(ownsSubstitute(getSubstitutes(boxes), { 900: 1 })).toBe(true);
    expect(getSubstitutes(undefined)).toEqual([]);
  });

  it('the box plan never opens a substitute', () => {
    const plan = planBoxOpening({
      inventory: { 900: 5 },
      boxes: { 900: sub(900, [[1]]) },
      evaluate: (inventory) => ({ 1: Math.max(0, 3 - (inventory[1] || 0)) }),
    });
    expect(plan.steps).toEqual([]);
  });
});

describe('box plan: select picks', () => {
  it('a box with picks > 1 gives the chosen item that many times per box', () => {
    const boxes = { 901: { game_id: 901, type: 'select', picks: 2, contents: [{ game_id: 1, qty: 3 }] } };
    const plan = planBoxOpening({
      inventory: { 901: 5 },
      boxes,
      evaluate: (inventory) => ({ 1: Math.max(0, 10 - (inventory[1] || 0)) }),
    });
    // 6 per box → 2 boxes cover 10.
    expect(plan.steps).toEqual([{ boxId: '901', type: 'select', count: 2, choice: '1', gains: { 1: 12 } }]);
  });
});

describe('sync: Boxes tab', () => {
  const materials = {
    forgery: {
      a1: { game_id: 11, Category: 'forgery', SubCategory: 'gear', tier: 1 },
      a2: { game_id: 12, Category: 'forgery', SubCategory: 'gear', tier: 2 },
    },
    ascension: {
      x: { game_id: 21, Category: 'ascension', SubCategory: 'ascension' },
      y: { game_id: 22, Category: 'ascension', SubCategory: 'ascension' },
    },
    credit: { c: { game_id: 1, Category: 'credit', SubCategory: 'credit' } },
    misc: {
      core: { game_id: 99, Category: 'box', SubCategory: 'substitute' },
      pack: { game_id: 98, Category: 'box', SubCategory: 'box' },
    },
  };
  const ids = { Core: 99, Pack: 98, X: 21, Y: 22, Credit: 1 };
  const resolve = (row, nameColumn) => ids[row[nameColumn]] ?? null;
  const expand = materialGroupExpander(materials);

  it('expands @category, @subcategory and @category:Tn', () => {
    expect(expand('ascension', null)).toEqual([21, 22]);
    expect(expand('GEAR', null)).toEqual([11, 12]);
    expect(expand('forgery', 2)).toEqual([12]);
    expect(expand('nothing', null)).toEqual([]);
  });

  it('substitute rows carry cost and scope; a group stands for every material in it', () => {
    const rows = [
      { box: 'Core', type: 'substitute', item: '@forgery:T1', cost: '1', scope: 'skill, weapon' },
      { box: 'Core', type: 'substitute', item: '@forgery:T2', cost: '3', scope: 'skill, weapon' },
      { box: 'Core', type: 'substitute', item: 'X', cost: '0.5' },
    ];
    expect(transformBoxes(rows, resolve, () => {}, expand)).toEqual({
      99: {
        game_id: 99,
        type: 'substitute',
        contents: [
          { game_id: 11, cost: 1, scope: ['skill', 'weapon'] },
          { game_id: 12, cost: 3, scope: ['skill', 'weapon'] },
          { game_id: 21, cost: 0.5 },
        ],
      },
    });
  });

  it('a substitute row without a positive cost is logged and skipped', () => {
    const lines = [];
    const rows = [{ box: 'Core', type: 'substitute', item: 'X', qty: '1' }];
    expect(transformBoxes(rows, resolve, (l) => lines.push(l), expand)).toEqual({});
    expect(lines[0]).toMatch(/cost/);
  });

  it('select rows: qty per pick, coins as a plain row, picks from any row (default 1)', () => {
    const rows = [
      { box: 'Pack', type: 'select', item: 'X', qty: '2' },
      { box: 'Pack', type: 'select', item: 'Credit', qty: '50000', picks: '2' },
    ];
    expect(transformBoxes(rows, resolve, () => {}, expand)).toEqual({
      98: {
        game_id: 98,
        type: 'select',
        picks: 2,
        contents: [{ game_id: 21, qty: 2 }, { game_id: 1, qty: 50000 }],
      },
    });
    expect(transformBoxes([{ box: 'Pack', type: 'select', item: 'X', qty: '1' }], resolve, () => {}, expand)[98].picks).toBe(1);
  });

  it('a duplicate listing keeps the first row; a group matching nothing is skipped', () => {
    const lines = [];
    const rows = [
      { box: 'Pack', type: 'select', item: '@ascension', qty: '1' },
      { box: 'Pack', type: 'select', item: 'X', qty: '5' },
      { box: 'Core', type: 'substitute', item: '@weekly', cost: '1' },
    ];
    expect(transformBoxes(rows, resolve, (l) => lines.push(l), expand)).toEqual({
      98: { game_id: 98, type: 'select', picks: 1, contents: [{ game_id: 21, qty: 1 }, { game_id: 22, qty: 1 }] },
    });
    expect(lines.some((l) => /already lists/.test(l))).toBe(true);
    expect(lines.some((l) => /matches no material/.test(l))).toBe(true);
  });
});
