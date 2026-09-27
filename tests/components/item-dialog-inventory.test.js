import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ItemDialog from '@/components/planner/ItemDialog.vue';

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
 * The dialog has two ways to write to the inventory and they must never be live at
 * the same time: `add` tops the stock up, `set` overwrites it. The emitted payload
 * carries the mode so the store knows which action to call.
 */
const single = { id: 'mat-1', name: 'Single', need: 100, owned: 20, synthesize: 0 };

const tiered = [
  { id: 't1', name: 'T1', tier: 1, need: 90, owned: 12, synthesize: 0 },
  { id: 't2', name: 'T2', tier: 2, need: 30, owned: 4, synthesize: 0 },
];

const mountDialog = (props = {}) => mount(ItemDialog, {
  props: { visible: true, item: single, relatedItems: [], ...props },
});

const setMode = async (wrapper, mode) => {
  const tab = wrapper.findAll('.mode-tab').find((b) => b.classes().includes(`is-${mode}`));
  await tab.trigger('click');
};

describe('ItemDialog inventory modes', () => {
  it('starts in add mode so a stock is never overwritten by a sticky mode', () => {
    const wrapper = mountDialog();
    const active = wrapper.find('.mode-tab.is-active');
    expect(active.classes()).toContain('is-add');
    expect(wrapper.find('.inventory-input input').element.value).toBe('');
  });

  it('emits the entered amount with mode add', async () => {
    const wrapper = mountDialog();
    await wrapper.find('.inventory-input input').setValue(5);
    await wrapper.find('.inventory-input button').trigger('click');

    expect(wrapper.emitted('updateInventory')).toEqual([
      [{ id: 'mat-1', quantity: 5, mode: 'add' }],
    ]);
  });

  it('prefills the current stock when switching to set mode', async () => {
    const wrapper = mountDialog();
    await setMode(wrapper, 'set');
    expect(wrapper.find('.inventory-input input').element.value).toBe('20');
  });

  it('emits the overwritten amount with mode set', async () => {
    const wrapper = mountDialog();
    await setMode(wrapper, 'set');
    await wrapper.find('.inventory-input input').setValue(7);
    await wrapper.find('.inventory-input button').trigger('click');

    expect(wrapper.emitted('updateInventory')).toEqual([
      [{ id: 'mat-1', quantity: 7, mode: 'set' }],
    ]);
  });

  // Setting to 0 is how you clear a stock, so it must not be swallowed as "no input".
  it('treats 0 as a real edit in set mode but a no-op in add mode', async () => {
    const adding = mountDialog();
    await adding.find('.inventory-input input').setValue(0);
    await adding.find('.inventory-input button').trigger('click');
    expect(adding.emitted('updateInventory')).toBeUndefined();

    const setting = mountDialog();
    await setMode(setting, 'set');
    await setting.find('.inventory-input input').setValue(0);
    await setting.find('.inventory-input button').trigger('click');
    expect(setting.emitted('updateInventory')).toEqual([
      [{ id: 'mat-1', quantity: 0, mode: 'set' }],
    ]);
  });

  // A blank box in set mode must not be read as 0 — that would wipe a stock the
  // user deliberately left alone.
  it('skips a blank box instead of writing 0', async () => {
    const wrapper = mountDialog();
    await setMode(wrapper, 'set');
    await wrapper.find('.inventory-input input').setValue('');
    await wrapper.find('.inventory-input button').trigger('click');

    expect(wrapper.emitted('updateInventory')).toBeUndefined();
  });

  it('switching back to add clears the prefilled stock', async () => {
    const wrapper = mountDialog();
    await setMode(wrapper, 'set');
    await setMode(wrapper, 'add');
    expect(wrapper.find('.inventory-input input').element.value).toBe('');
  });
});

describe('ItemDialog inventory modes (tiered)', () => {
  const mountTiered = () => mountDialog({ item: { id: 't1', name: 'whispers' }, relatedItems: tiered });

  it('shows one input per tier with the sign of the active mode', async () => {
    const wrapper = mountTiered();
    expect(wrapper.findAll('.tier-input')).toHaveLength(2);
    expect(wrapper.findAll('.input-sign').map((s) => s.text())).toEqual(['+', '+']);

    await setMode(wrapper, 'set');
    expect(wrapper.findAll('.input-sign').map((s) => s.text())).toEqual(['=', '=']);
  });

  it('prefills every tier with its own stock in set mode', async () => {
    const wrapper = mountTiered();
    await setMode(wrapper, 'set');
    expect(wrapper.findAll('.tier-input').map((i) => i.element.value)).toEqual(['12', '4']);
  });

  it('saves only the tiers that were filled in, tagged with the mode', async () => {
    const wrapper = mountTiered();
    const inputs = wrapper.findAll('.tier-input');
    await inputs[1].setValue(3);
    await wrapper.find('.save-all-btn').trigger('click');

    expect(wrapper.emitted('updateInventory')).toEqual([
      [{ id: 't2', quantity: 3, mode: 'add' }],
    ]);
  });

  it('saves every prefilled tier in set mode', async () => {
    const wrapper = mountTiered();
    await setMode(wrapper, 'set');
    await wrapper.findAll('.tier-input')[0].setValue(99);
    await wrapper.find('.save-all-btn').trigger('click');

    expect(wrapper.emitted('updateInventory')).toEqual([
      [{ id: 't1', quantity: 99, mode: 'set' }],
      [{ id: 't2', quantity: 4, mode: 'set' }],
    ]);
  });
});
