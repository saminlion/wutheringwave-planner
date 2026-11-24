import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

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
const cardIds = (w) => w.findAll('.inventory-card').map((c) => c.attributes('data-id'));
const section = (w, category) =>
  w.findAll('.category-section').find((s) => s.find(".category-title").text() === category);
const expandAll = async (w) => { await w.findAll('.fold-all')[0].trigger('click'); };

beforeEach(() => localStorage.clear());

describe('InventoryView — version folds per category', () => {
  it('no Version values at all → old layout: no fold headers, no buttons, every card once', () => {
    state.materials = { credit: { c: m('credit', 'credit') }, common: { a: m(1, 'common'), b: m(2, 'common') } };
    const w = mount(InventoryView);
    expect(w.findAll('.version-header')).toHaveLength(0);
    expect(w.findAll('.fold-all')).toHaveLength(0);
    expect(cardIds(w)).toEqual(['credit', '1', '2']);
  });

  it('credits / boss show once and never inside a fold; only the versioned category folds', async () => {
    state.materials = {
      credit: { c: m('credit', 'credit') },
      common: { a: m(1, 'common', '1'), b: m(2, 'common', '2'), c: m(3, 'common', '3') },
      boss: { x: m('boss', 'boss') },
    };
    const w = mount(InventoryView);
    expect(section(w, 'credit').findAll('.version-header')).toHaveLength(0);
    expect(section(w, 'boss').findAll('.version-header')).toHaveLength(0);
    expect(section(w, 'common').findAll('.version-name')).toHaveLength(3);

    // default: only the newest (3) open
    expect(cardIds(w)).toEqual(['credit', '3', 'boss']);

    await expandAll(w);
    expect(cardIds(w)).toEqual(['credit', '3', '2', '1', 'boss']);
  });

  it('toggling one fold persists per category and survives a remount', async () => {
    state.materials = {
      common: { a: m(1, 'common', '1'), b: m(2, 'common', '2') },
      forgery: { a: m(11, 'forgery', '1'), b: m(12, 'forgery', '2') },
    };
    const w = mount(InventoryView);
    await section(w, 'common').findAll('.version-header')[1].trigger('click'); // common v1
    expect(cardIds(w)).toEqual(['2', '1', '12']);
    expect(JSON.parse(localStorage.getItem('gameplanner_inventory_groups')).ww).toEqual({ 'common::1': true });
    expect(cardIds(mount(InventoryView))).toEqual(['2', '1', '12']);
  });

  it('collapse all hides every fold but keeps versionless categories', async () => {
    state.materials = { credit: { c: m('credit', 'credit') }, common: { a: m(1, 'common', '1') } };
    const w = mount(InventoryView);
    await w.findAll('.fold-all')[1].trigger('click');
    expect(cardIds(w)).toEqual(['credit']);
  });

  describe('real WW data', () => {
    const all = Object.values(wwMaterials).flatMap((c) => Object.values(c));

    it('all folds open → every material on the page exactly once', async () => {
      state.materials = wwMaterials;
      const w = mount(InventoryView);
      await expandAll(w);
      const ids = cardIds(w);
      expect(ids.length).toBe(all.length);
      expect(new Set(ids).size).toBe(all.length);
    });

    it('folds only where the sheet has versions; credit / boss / ascension have none', () => {
      state.materials = wwMaterials;
      const w = mount(InventoryView);
      for (const category of Object.keys(wwMaterials)) {
        const versions = new Set(Object.values(wwMaterials[category]).map((x) => x.version).filter(Boolean));
        expect(section(w, category).findAll('.version-header').length, category).toBe(versions.size);
      }
      for (const category of ['credit', 'boss', 'ascension']) {
        if (wwMaterials[category]) expect(section(w, category).findAll('.version-header')).toHaveLength(0);
      }
    });
  });
});
