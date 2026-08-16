import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ItemDialog from '@/components/planner/ItemDialog.vue';
import { MaterialCalculator } from '@/core/engine/calculator';

vi.mock('@/services/materialHelper/dbUtils', () => ({
  getMaterialFieldById: vi.fn(() => null),
}));

vi.mock('@/composables/useLocale', () => ({
  useLocale: () => ({
    tUI: (key) => key,
    tMaterial: (_id, fallback) => fallback,
  }),
}));

/**
 * The planner card and this dialog must agree. `owned` is the player's stock
 * BEFORE synthesis; the engine spends part of it on higher tiers, so only the
 * engine's shortage (passed down as `actualNeed`) is the real remaining need.
 */
describe('ItemDialog need', () => {
  const t1 = 7110010001;
  const tieredMaterials = {
    whispers: {
      1: { name: 't1', game_id: t1, synthesizable: { to: 2, count: 3 } },
      2: { name: 't2', game_id: 7110010002, synthesizable: { to: 3, count: 3 } },
      3: { name: 't3', game_id: 7110010003 },
    },
  };
  const db = {
    common: {
      a: { game_id: t1, SubCategory: 'whispers' },
      b: { game_id: 7110010002, SubCategory: 'whispers' },
      c: { game_id: 7110010003, SubCategory: 'whispers' },
    },
  };

  // Own 120 T1, need 100 T1 + 10 T3. Crafting the T3 eats 90 T1, leaving 30
  // against a requirement of 100 → 70 short.
  const calc = new MaterialCalculator({ materials: { database: db } });
  const result = calc.calculate({ [t1]: 120 }, tieredMaterials, { [t1]: 100, 7110010003: 10 });

  it('the engine reports the T1 shortage the naive formula misses', () => {
    expect(result.final_needs[t1]).toBe(70);
    // What the dialog used to compute on its own: need - owned - synthesize.
    expect(Math.max(0, 100 - 120 - 0)).toBe(0);
  });

  const item = {
    id: t1,
    name: 'Lost Whispers',
    need: 100,
    owned: 120,
    synthesize: 0,
    synthesisConsumed: 90,
    actualNeed: result.final_needs[t1],
  };

  it('renders the engine shortage, not need - owned', () => {
    const wrapper = mount(ItemDialog, { props: { visible: true, item } });
    const needText = wrapper.find('.need-row .value').text();
    expect(needText).toBe('70');
    expect(wrapper.find('.need-row .value').classes()).toContain('incomplete');
  });

  it('shows the stock spent on synthesis so the arithmetic reads correctly', () => {
    const wrapper = mount(ItemDialog, { props: { visible: true, item } });
    expect(wrapper.text()).toContain('-90');
  });

  it('falls back to need - owned - synthesize when no actualNeed is supplied', () => {
    const wrapper = mount(ItemDialog, {
      props: { visible: true, item: { id: 1, need: 10, owned: 4, synthesize: 2 } },
    });
    expect(wrapper.find('.need-row .value').text()).toBe('4');
  });
});
