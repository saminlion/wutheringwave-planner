import { describe, it, expect } from 'vitest';
import { allocateSubstitutes, getSubstitutes, ownsSubstitute } from '@/services/materialHelper/substitutes';
import { planBoxOpening } from '@/services/materialHelper/boxPlan';
import { transformBoxes, materialGroupExpander } from '../../scripts/lib/boxes.js';

const sub = (id, ids, qty = 1) => ({ game_id: id, type: 'substitute', contents: ids.map((gid) => ({ game_id: gid, qty })) });

describe('allocateSubstitutes', () => {
  it('fills what is still short and says how many substitutes it spends', () => {
    // Need 3 more of X; own 5 AllA that stands in for X or Y.
    const plan = allocateSubstitutes({ 1: 3 }, [sub(900, [1, 2])], { 900: 5 });

    expect(plan.uses).toEqual([{ substituteId: '900', materialId: '1', count: 3, covers: 3 }]);
    expect(plan.used).toEqual({ 900: 3 });
    expect(plan.covered).toEqual({ 1: 3 });
    expect(plan.remaining).toEqual({});
    expect(plan.resolved).toEqual(['1']);
  });

  it('not enough substitutes: covers the smallest shortages first, leaves the rest short', () => {
    const plan = allocateSubstitutes({ 1: 5, 2: 2 }, [sub(900, [1, 2])], { 900: 3 });

    expect(plan.covered).toEqual({ 2: 2, 1: 1 });
    expect(plan.resolved).toEqual(['2']);
    expect(plan.remaining).toEqual({ 1: 4 });
  });

  it('a substitute worth qty > 1 rounds up and never over-reports coverage', () => {
    const plan = allocateSubstitutes({ 1: 5 }, [sub(900, [1], 2)], { 900: 10 });

    expect(plan.used).toEqual({ 900: 3 });
    expect(plan.covered).toEqual({ 1: 5 });
  });

  it('spends the narrow substitute before the broad one', () => {
    const narrow = sub(901, [1]);
    const broad = sub(902, [1, 2, 3]);
    const plan = allocateSubstitutes({ 1: 2, 2: 2 }, [broad, narrow], { 901: 2, 902: 2 });

    expect(plan.used).toEqual({ 901: 2, 902: 2 });
    expect(plan.remaining).toEqual({});
  });

  it('ignores materials no substitute covers, and substitutes not owned', () => {
    const plan = allocateSubstitutes({ 1: 2, 5: 4 }, [sub(900, [1])], {});

    expect(plan.uses).toEqual([]);
    expect(plan.remaining).toEqual({ 1: 2, 5: 4 });
  });

  it('getSubstitutes / ownsSubstitute pick only substitute entries', () => {
    const boxes = {
      900: sub(900, [1]),
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
      boxes: { 900: sub(900, [1]) },
      evaluate: (inventory) => ({ 1: Math.max(0, 3 - (inventory[1] || 0)) }),
    });
    expect(plan.steps).toEqual([]);
  });
});

describe('sync: Boxes tab substitutes and @groups', () => {
  const materials = {
    forgery: {
      a1: { game_id: 11, Category: 'forgery', SubCategory: 'gear', tier: 1 },
      a2: { game_id: 12, Category: 'forgery', SubCategory: 'gear', tier: 2 },
    },
    ascension: {
      x: { game_id: 21, Category: 'ascension', SubCategory: 'ascension' },
      y: { game_id: 22, Category: 'ascension', SubCategory: 'ascension' },
    },
    misc: { alla: { game_id: 99, Category: 'misc', SubCategory: 'substitute' } },
  };
  const ids = { AllA: 99, X: 21 };
  const resolve = (row, nameColumn) => ids[row[nameColumn]] ?? null;
  const expand = materialGroupExpander(materials);

  it('expands @category, @subcategory and @category:Tn', () => {
    expect(expand('ascension', null)).toEqual([21, 22]);
    expect(expand('GEAR', null)).toEqual([11, 12]);
    expect(expand('forgery', 2)).toEqual([12]);
    expect(expand('nothing', null)).toEqual([]);
  });

  it('a substitute row with a group stands for every material in it', () => {
    const rows = [
      { box: 'AllA', type: 'substitute', item: '@ascension', qty: '1' },
      { box: 'AllA', type: 'substitute', item: '@forgery:T2', qty: '2' },
      { box: 'AllA', type: 'substitute', item: 'X', qty: '5' }, // already listed by @ascension
    ];
    const lines = [];
    expect(transformBoxes(rows, resolve, (l) => lines.push(l), expand)).toEqual({
      99: {
        game_id: 99,
        type: 'substitute',
        contents: [{ game_id: 21, qty: 1 }, { game_id: 22, qty: 1 }, { game_id: 12, qty: 2 }],
      },
    });
    expect(lines).toHaveLength(1);
  });

  it('a group that matches nothing is logged and skipped', () => {
    const lines = [];
    const rows = [{ box: 'AllA', type: 'substitute', item: '@weekly', qty: '1' }];
    expect(transformBoxes(rows, resolve, (l) => lines.push(l), expand)).toEqual({});
    expect(lines[0]).toMatch(/matches no material/);
  });
});
