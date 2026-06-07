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
});
