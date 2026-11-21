import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Node 25's own global localStorage shadows happy-dom's and does not work without a file.
const { state } = vi.hoisted(() => {
  class MemoryStorage {
    map = new Map();
    get length() { return this.map.size; }
    key(i) { return [...this.map.keys()][i] ?? null; }
    getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
    setItem(k, v) { this.map.set(k, String(v)); }
    removeItem(k) { this.map.delete(k); }
    clear() { this.map.clear(); }
  }
  globalThis.localStorage = new MemoryStorage();
  return { state: { materials: {} } };
});

vi.mock('@/composables/useLocale', () => ({
  useLocale: () => ({ tUI: (k) => k, tMaterial: (_id, label) => label }),
}));
vi.mock('@/store/game', () => ({
  useGameStore: () => ({ currentGameId: 'ww', getData: (t) => (t === 'materials' ? state.materials : null) }),
}));
vi.mock('@/store/inventory', () => ({
  useInventoryStore: () => ({ inventory: {}, hydrate: () => {}, addMaterial: vi.fn(), removeMaterial: vi.fn() }),
}));
vi.mock('vue3-toastify', () => ({ toast: { success: () => {} } }));

import InventoryView from '@/views/InventoryView.vue';
import wwMaterials from '@/games/wutheringwave/data/materials.json';

const m = (game_id, Category, version) => ({ game_id, label: String(game_id), Category, SubCategory: Category, version });

beforeEach(() => localStorage.clear());

describe('InventoryView — version folding', () => {
  it('without any Version values renders every card with no version headers (old layout)', () => {
    state.materials = { credit: { c: m('credit', 'credit') }, common: { a: m(1, 'common'), b: m(2, 'common') } };
    const w = mount(InventoryView);
    expect(w.findAll('.version-header')).toHaveLength(0);
    expect(w.findAll('.fold-all')).toHaveLength(0);
    expect(w.findAll('.inventory-card')).toHaveLength(3);
  });

  it('opens only the newest version; credits show inside it; toggling persists', async () => {
    state.materials = {
      credit: { c: m('credit', 'credit') },
      common: { a: m(1, 'common', '1'), b: m(2, 'common', '2') },
    };
    const w = mount(InventoryView);
    const headers = w.findAll('.version-header');
    expect(headers.map((h) => h.find('.version-name').text())).toEqual(['inventory.version', 'inventory.version']);
    expect(w.findAll('.inventory-card').map((c) => c.attributes('title'))).toEqual(['credit', '2']);

    await headers[1].trigger('click');
    expect(w.findAll('.inventory-card').map((c) => c.attributes('title'))).toEqual(['credit', '2', 'credit', '1']);
    expect(JSON.parse(localStorage.getItem('gameplanner_inventory_groups')).ww).toEqual({ 1: true });

    const again = mount(InventoryView);
    expect(again.findAll('.inventory-card')).toHaveLength(4);
  });

  it('collapse all / expand all', async () => {
    state.materials = { common: { a: m(1, 'common', '1'), b: m(2, 'common', '2') } };
    const w = mount(InventoryView);
    const [expand, collapse] = w.findAll('.fold-all');
    await collapse.trigger('click');
    expect(w.findAll('.inventory-card')).toHaveLength(0);
    await expand.trigger('click');
    await nextTick();
    expect(w.findAll('.inventory-card')).toHaveLength(2);
  });

  it('renders the real WW data: one header per version, credit in the open group', () => {
    state.materials = wwMaterials;
    const w = mount(InventoryView);
    const versions = new Set(
      Object.values(wwMaterials).flatMap((c) => Object.values(c)).map((x) => x.version).filter(Boolean),
    );
    expect(w.findAll('.version-header')).toHaveLength(versions.size);
    const creditId = Object.values(wwMaterials.credit)[0].game_id;
    const titles = w.findAll('.inventory-card').map((c) => c.attributes('title'));
    expect(titles).toContain(Object.values(wwMaterials.credit)[0].label);
    expect(creditId).toBeDefined();
  });
});
