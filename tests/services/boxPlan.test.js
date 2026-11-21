import { describe, it, expect } from 'vitest';
import { planBoxOpening, createShortageEvaluator } from '@/services/materialHelper/boxPlan';
import { MaterialCalculator } from '@/core/engine/calculator';
import { transformBoxes } from '../../scripts/lib/boxes.js';

const silent = { debug() {}, warn() {}, info() {}, error() {} };

// Same wiring PlannerView uses, minus the game store.
const evaluatorFor = (totalNeeds, { tiers = {}, db = {}, expCategories = {} } = {}) => {
  const subCategoryOf = (id) => {
    for (const category of Object.values(db)) {
      for (const item of Object.values(category)) {
        if (String(item.game_id) === String(id)) return item.SubCategory || item.Category;
      }
    }
    return null;
  };
  const calculate = (inventory, tieredMaterials, needs) =>
    new MaterialCalculator({ logger: silent, materials: { database: db } }).calculate(inventory, tieredMaterials, needs);
  return createShortageEvaluator({ totalNeeds, tieredMaterials: tiers, expCategories, calculate, subCategoryOf });
};

describe('planBoxOpening', () => {
  it('fixed box: says how many to open, and leaves the shortage itself alone', () => {
    // Need 10 of A; one box gives 5 A. Own 7 boxes.
    const boxes = { 900: { game_id: 900, type: 'fixed', contents: [{ game_id: 1, qty: 5 }] } };
    const plan = planBoxOpening({ inventory: { 900: 7 }, boxes, evaluate: evaluatorFor({ 1: 10 }) });

    expect(plan.before).toEqual({ 1: 10 });
    expect(plan.steps).toEqual([{ boxId: '900', type: 'fixed', count: 2, choice: null, gains: { 1: 10 } }]);
    expect(plan.after).toEqual({});
    expect(plan.resolved).toEqual(['1']);
    expect(plan.covered).toEqual({ 1: 10 });
  });

  it('fixed box: not enough boxes covers what it can and opens all of them', () => {
    const boxes = {
      900: { game_id: 900, type: 'fixed', contents: [{ game_id: 1, qty: 5 }, { game_id: 2, qty: 1 }] },
    };
    const plan = planBoxOpening({ inventory: { 900: 3 }, boxes, evaluate: evaluatorFor({ 1: 10, 2: 4 }) });

    expect(plan.steps[0].count).toBe(3);
    expect(plan.covered).toEqual({ 1: 10, 2: 3 });
    expect(plan.resolved).toEqual(['1']);
    expect(plan.after).toEqual({ 2: 1 });
  });

  it('select box: splits the picks across what is short', () => {
    const boxes = {
      901: { game_id: 901, type: 'select', contents: [{ game_id: 1, qty: 1 }, { game_id: 2, qty: 1 }] },
    };
    const plan = planBoxOpening({ inventory: { 901: 10 }, boxes, evaluate: evaluatorFor({ 1: 3, 2: 2 }) });

    const picks = Object.fromEntries(plan.steps.map((s) => [s.choice, s.count]));
    expect(picks).toEqual({ 1: 3, 2: 2 });
    expect(plan.steps.every((s) => s.type === 'select')).toBe(true);
    expect(plan.after).toEqual({});
  });

  it('counts low-tier contents towards a higher-tier shortage through synthesis', () => {
    // Need 2 × T2; 3 T1 craft one T2; a box gives 2 T1 → 6 T1 = 3 boxes.
    const tiers = {
      bolete: {
        1: { name: 'b1', game_id: 11, synthesizable: { to: 2, count: 3 } },
        2: { name: 'b2', game_id: 12 },
      },
    };
    const db = {
      common: {
        b1: { game_id: 11, Category: 'common', SubCategory: 'bolete', tier: 1 },
        b2: { game_id: 12, Category: 'common', SubCategory: 'bolete', tier: 2 },
      },
    };
    const boxes = { 900: { game_id: 900, type: 'fixed', contents: [{ game_id: 11, qty: 2 }] } };
    const plan = planBoxOpening({ inventory: { 900: 10 }, boxes, evaluate: evaluatorFor({ 12: 2 }, { tiers, db }) });

    expect(plan.before).toEqual({ 12: 2 });
    expect(plan.steps.map((s) => s.count)).toEqual([3]);
    expect(plan.after).toEqual({});
  });

  it('EXP contents count by their value', () => {
    const expCategories = { player_exp: [{ id: 'e1', value: 100 }] };
    const boxes = { 900: { game_id: 900, type: 'fixed', contents: [{ game_id: 'e1', qty: 5 }] } };
    const plan = planBoxOpening({
      inventory: { 900: 9 },
      boxes,
      evaluate: evaluatorFor({ player_exp: 1000 }, { expCategories }),
    });

    expect(plan.steps[0].count).toBe(2);
    expect(plan.resolved).toEqual(['player_exp']);
  });

  it('no plan when no box is owned or no box helps', () => {
    const boxes = { 900: { game_id: 900, type: 'fixed', contents: [{ game_id: 99, qty: 5 }] } };
    const evaluate = evaluatorFor({ 1: 10 });

    expect(planBoxOpening({ inventory: {}, boxes, evaluate }).steps).toEqual([]);
    const useless = planBoxOpening({ inventory: { 900: 5 }, boxes, evaluate });
    expect(useless.steps).toEqual([]);
    expect(useless.after).toEqual({ 1: 10 });
  });
});

describe('sync: Boxes tab', () => {
  const ids = { 'advanced chest': 900, 'boss selector': 901, a: 1, b: 2, x: 3 };
  const resolve = (row, nameColumn, idColumn) =>
    ids[String(row[nameColumn] ?? '').toLowerCase()] ?? row[idColumn] ?? null;

  it('groups rows per box, blank type = fixed', () => {
    const rows = [
      { box: 'Advanced Chest', type: null, item: 'A', qty: '5' },
      { box: 'Advanced Chest', type: null, item: 'B', qty: '5' },
      { box: 'Boss Selector', type: 'select', item: 'X', qty: '1' },
    ];
    expect(transformBoxes(rows, resolve, () => {})).toEqual({
      900: { game_id: 900, type: 'fixed', contents: [{ game_id: 1, qty: 5 }, { game_id: 2, qty: 5 }] },
      901: { game_id: 901, type: 'select', picks: 1, contents: [{ game_id: 3, qty: 1 }] },
    });
  });

  it('logs and skips rows it cannot resolve — no guessing', () => {
    const lines = [];
    const rows = [
      { box: 'Advanced Chest', item: 'Typo', qty: '5' },
      { box: 'Nope', item: 'A', qty: '5' },
      { box: 'Advanced Chest', item: 'A', qty: '0' },
      { box: 'Advanced Chest', type: 'random', item: 'A', qty: '1' },
      { box: 'Advanced Chest', item: 'B', qty: '2' },
      { box: 'Advanced Chest', type: 'select', item: 'A', qty: '1' },
    ];
    expect(transformBoxes(rows, resolve, (l) => lines.push(l))).toEqual({
      900: { game_id: 900, type: 'fixed', contents: [{ game_id: 2, qty: 2 }] },
    });
    expect(lines).toHaveLength(5);
  });
});
