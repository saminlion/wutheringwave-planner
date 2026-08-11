import { describe, it, expect } from 'vitest';
import { SynthesisEngine } from '@/core/engine/synthesis';

describe('SynthesisEngine', () => {
  it('should create with default 3:1 ratio', () => {
    const engine = new SynthesisEngine();
    expect(engine.ratio).toBe(3);
  });

  it('should accept custom ratio', () => {
    const engine = new SynthesisEngine({ ratio: 4 });
    expect(engine.ratio).toBe(4);
  });

  describe('forward (minimal synthesis)', () => {
    // Ascension-style chain with no T1 (game ids 2..5), 3:1 ratio.
    const tieredMaterials = {
      chain: {
        2: { name: 'chain_t2', game_id: 102, synthesizable: { to: 3, count: 3 } },
        3: { name: 'chain_t3', game_id: 103, synthesizable: { to: 4, count: 3 } },
        4: { name: 'chain_t4', game_id: 104, synthesizable: { to: 5, count: 3 } },
        5: { name: 'chain_t5', game_id: 105 },
      },
    };
    const db = {
      forgery_ascension: {
        a: { game_id: 102, SubCategory: 'chain' },
        b: { game_id: 103, SubCategory: 'chain' },
        c: { game_id: 104, SubCategory: 'chain' },
        d: { game_id: 105, SubCategory: 'chain' },
      },
    };

    it('synthesizes only the minimum and reports the remaining shortage at the lowest tier', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      // Need: t2=120, t3=4, t4=3, t5=2  (= 213 T2-equivalent). Own 200 t2 → short 13.
      const shortages = { 102: 120, 103: 4, 104: 3, 105: 2 };
      const inventory = { 102: 200 };

      const fwd = engine.forward(inventory, tieredMaterials, shortages, db);
      // Minimal craft amounts, not the greedy "all excess".
      expect(fwd.synthesisResults[103].synthesized).toBe(31);
      expect(fwd.synthesisResults[104].synthesized).toBe(9);
      expect(fwd.synthesisResults[105].synthesized).toBe(2);

      const back = engine.backward(fwd.updatedInventory, tieredMaterials, shortages);
      // Shortage lands entirely on the farmable lowest tier, higher tiers satisfied.
      expect(back.finalNeeds[102]).toBe(13);
      expect(back.finalNeeds[103]).toBe(0);
      expect(back.finalNeeds[104]).toBe(0);
      expect(back.finalNeeds[105]).toBe(0);
    });

    it('reports zero shortage when low-tier stock fully covers all tiers', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      const shortages = { 102: 120, 103: 4, 104: 3, 105: 2 }; // 213 T2-equiv
      const inventory = { 102: 213 };

      const fwd = engine.forward(inventory, tieredMaterials, shortages, db);
      const back = engine.backward(fwd.updatedInventory, tieredMaterials, shortages);
      expect(back.finalNeeds[102]).toBe(0);
      expect(back.finalNeeds[103]).toBe(0);
      expect(back.finalNeeds[104]).toBe(0);
      expect(back.finalNeeds[105]).toBe(0);
    });

    it('does not synthesize when nothing is needed above', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      const shortages = { 102: 10 };
      const inventory = { 102: 100 };
      const fwd = engine.forward(inventory, tieredMaterials, shortages, db);
      expect(Object.keys(fwd.synthesisResults)).toHaveLength(0);
    });
  });

  describe('per-subcategory ratios', () => {
    // Two subcategories in one game with different, non-default ratios.
    const tieredMaterials = {
      stone: {
        1: { name: 'stone_t1', game_id: 201, synthesizable: { to: 2, count: 4 } },
        2: { name: 'stone_t2', game_id: 202 },
      },
      pearl: {
        1: { name: 'pearl_t1', game_id: 301, synthesizable: { to: 2, count: 2 } },
        2: { name: 'pearl_t2', game_id: 302, synthesizable: { to: 3, count: 5 } },
        3: { name: 'pearl_t3', game_id: 303 },
      },
    };
    const db = {
      common: {
        a: { game_id: 201, SubCategory: 'stone' },
        b: { game_id: 202, SubCategory: 'stone' },
      },
      ascension: {
        c: { game_id: 301, SubCategory: 'pearl' },
        d: { game_id: 302, SubCategory: 'pearl' },
        e: { game_id: 303, SubCategory: 'pearl' },
      },
    };

    it('uses each subcategory own ratio instead of the engine default', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      const fwd = engine.forward({ 201: 12, 301: 6 }, tieredMaterials, { 202: 3, 302: 3 }, db);

      // stone is 4:1 -> 12 T1 makes exactly 3 T2 (a 3:1 default would make 4).
      expect(fwd.synthesisResults[202].synthesized).toBe(3);
      expect(fwd.synthesisResults[202].used).toBe(12);
      // pearl is 2:1 -> 6 T1 makes exactly 3 T2.
      expect(fwd.synthesisResults[302].synthesized).toBe(3);
      expect(fwd.synthesisResults[302].used).toBe(6);
    });

    it('propagates demand through tiers at differing ratios', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      // 1x T3 needs 5x T2, each of which needs 2x T1 => 10x T1.
      const fwd = engine.forward({ 301: 10 }, tieredMaterials, { 303: 1 }, db);

      expect(fwd.synthesisResults[302].synthesized).toBe(5);
      expect(fwd.synthesisResults[303].synthesized).toBe(1);

      const back = engine.backward(fwd.updatedInventory, tieredMaterials, fwd.effectiveShortages);
      expect(back.finalNeeds[303]).toBe(0);
    });

    it('decomposes surplus at the lower tier payout rate', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      // 2 surplus pearl T3, no needs. Each T3 came from 5x T2, each T2 from 2x T1.
      const back = engine.backward({ 303: 2 }, tieredMaterials, {});

      expect(back.decomposedGained[302]).toBe(10); // 2 x 5, not 2 x 3
      expect(back.decomposedGained[301]).toBe(20); // 10 x 2
    });
  });

  describe('cross-subcategory recipes', () => {
    // Crafting pearl T2 consumes 2x pearl T1 AND 3x stone T2 from another subcategory.
    const tieredMaterials = {
      stone: {
        1: { name: 'stone_t1', game_id: 201, synthesizable: { to: 2, count: 4 } },
        2: { name: 'stone_t2', game_id: 202 },
      },
      pearl: {
        1: {
          name: 'pearl_t1',
          game_id: 301,
          synthesizable: { to: 2, count: 2, extra: { 202: 3 } },
        },
        2: { name: 'pearl_t2', game_id: 302 },
      },
    };
    const db = {
      common: {
        a: { game_id: 201, SubCategory: 'stone' },
        b: { game_id: 202, SubCategory: 'stone' },
      },
      ascension: {
        c: { game_id: 301, SubCategory: 'pearl' },
        d: { game_id: 302, SubCategory: 'pearl' },
      },
    };

    it('consumes the cross-subcategory ingredient alongside the tier below', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      const inventory = { 301: 4, 202: 6 };
      const fwd = engine.forward(inventory, tieredMaterials, { 302: 2 }, db);

      expect(fwd.synthesisResults[302].synthesized).toBe(2);
      expect(fwd.synthesisResults[302].used).toBe(4); // 2 x 2 pearl T1
      expect(fwd.synthesisResults[302].usedExtra).toEqual({ 202: 6 }); // 2 x 3 stone T2
      expect(fwd.updatedInventory[301]).toBe(0);
      expect(fwd.updatedInventory[202]).toBe(0);
    });

    it('caps the craft by the scarcer cross-subcategory ingredient', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      // Enough pearl T1 for 5 crafts, but only enough stone T2 for 2.
      const fwd = engine.forward({ 301: 10, 202: 6 }, tieredMaterials, { 302: 5 }, db);

      expect(fwd.synthesisResults[302].synthesized).toBe(2);
      expect(fwd.updatedInventory[301]).toBe(6); // 10 - 2x2, untouched remainder
    });

    it('reports the ingredient as a need and crafts it from its own lower tier first', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      // No stone T2 owned, but 12 stone T1 -> 3 stone T2 at 4:1, enough for 1 pearl craft.
      const fwd = engine.forward({ 301: 2, 201: 12 }, tieredMaterials, { 302: 1 }, db);

      // stone T2 was never a listed shortage; the pearl recipe created the demand.
      expect(fwd.extraDemand[202]).toBe(3);
      expect(fwd.effectiveShortages[202]).toBe(3);
      expect(fwd.synthesisResults[202].synthesized).toBe(3); // supplier crafted first
      expect(fwd.synthesisResults[302].synthesized).toBe(1);
    });

    it('surfaces unfarmed ingredient demand in final needs', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      // Enough pearl T1 for 2 crafts, but zero stone anywhere.
      const fwd = engine.forward({ 301: 4 }, tieredMaterials, { 302: 2 }, db);
      const back = engine.backward(fwd.updatedInventory, tieredMaterials, fwd.effectiveShortages);

      expect(back.finalNeeds[202]).toBe(6); // must farm 6 stone T2
      expect(back.finalNeeds[302]).toBe(2); // pearl T2 still short, craft impossible
    });

    it('does not decompose a craft that consumed cross-subcategory ingredients', () => {
      const engine = new SynthesisEngine({ ratio: 3 });
      // 3 surplus pearl T2. Un-crafting would hand back pearl T1 the player cannot
      // actually recover, since the stone T2 is spent for good.
      const back = engine.backward({ 302: 3 }, tieredMaterials, {});

      expect(back.decomposedGained[301]).toBeUndefined();
      expect(back.decomposedConsumed[302]).toBeUndefined();
    });
  });
});
