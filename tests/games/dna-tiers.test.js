import { describe, it, expect } from 'vitest';
import { SynthesisEngine } from '@/core/engine/synthesis';
import { tieredMaterials, tieredMaterialsByGameId } from '@/games/dna/data/tiers';
import materials from '@/games/dna/data/materials.json';

/**
 * Guards the DNA synthesis table against the two things that silently corrupt
 * planning: a subcategory key that no longer matches materials.json (the engine
 * would never find the recipe), and a ratio drifting back to the engine default.
 */
describe('DNA tiered materials', () => {
  const bySubCategory = {};
  for (const [category, items] of Object.entries(materials)) {
    if (!items || typeof items !== 'object') continue;
    for (const item of Object.values(items)) {
      if (!item?.SubCategory) continue;
      (bySubCategory[item.SubCategory] ??= []).push({ ...item, Category: category });
    }
  }

  it('keys every entry by a SubCategory that exists in materials.json', () => {
    for (const subCategory of Object.keys(tieredMaterials)) {
      expect(bySubCategory, `unknown SubCategory: ${subCategory}`).toHaveProperty(subCategory);
    }
  });

  it('matches each declared tier to the same game_id in materials.json', () => {
    for (const [subCategory, tiers] of Object.entries(tieredMaterials)) {
      for (const [tier, entry] of Object.entries(tiers)) {
        const match = bySubCategory[subCategory].find(m => String(m.tier) === String(tier));
        expect(match, `${subCategory} T${tier} missing in materials.json`).toBeDefined();
        expect(String(entry.game_id), `${subCategory} T${tier} game_id`).toBe(String(match.game_id));
      }
    }
  });

  it.each([
    ['ascension', 5, ['pearl', 'flame', 'bough', 'rod', 'lense', 'dagger']],
    ['weapon_component', 3, ['blade', 'decoration', 'grip', 'bolt', 'frame', 'barrel']],
    ['talent', 3, ['herbal', 'emblem', 'veil', 'gleaming']],
  ])('uses the confirmed %s ratio of %d:1 on every craftable tier', (_category, ratio, subs) => {
    for (const sub of subs) {
      const tiers = tieredMaterials[sub];
      expect(tiers, `${sub} missing`).toBeDefined();
      const numeric = Object.keys(tiers).map(Number).sort((a, b) => a - b);
      for (const tier of numeric.slice(0, -1)) {
        expect(tiers[tier].synthesizable?.count, `${sub} T${tier}`).toBe(ratio);
      }
      // Top tier is the end of the chain.
      expect(tiers[numeric.at(-1)].synthesizable).toBeUndefined();
    }
  });

  it('leaves forgery and common out until their recipes are confirmed', () => {
    // forgery T2 needs an extra material that is not in materials.json yet;
    // declaring it early would let the planner craft T2 for free.
    for (const sub of ['tentacle', 'sacred', 'luno', 'stone', 'volatile', 'teardrop', 'chain', 'filthoid']) {
      expect(tieredMaterials, `${sub} declared before its recipe was confirmed`).not.toHaveProperty(sub);
    }
  });

  it('builds a reverse index covering every declared entry', () => {
    const declared = Object.values(tieredMaterials).flatMap(t => Object.values(t));
    expect(Object.keys(tieredMaterialsByGameId)).toHaveLength(declared.length);
  });

  describe('end-to-end through the engine', () => {
    const db = materials;

    it('rolls ascension T1 up to T3 at 5:1 per step', () => {
      const engine = new SynthesisEngine();
      // 1x T3 = 5x T2 = 25x T1.
      const fwd = engine.forward({ 9130010001: 25 }, tieredMaterials, { 9130010003: 1 }, db);

      expect(fwd.synthesisResults[9130010002].synthesized).toBe(5);
      expect(fwd.synthesisResults[9130010003].synthesized).toBe(1);

      const back = engine.backward(fwd.updatedInventory, tieredMaterials, fwd.effectiveShortages);
      expect(back.finalNeeds[9130010003]).toBe(0);
      expect(back.finalNeeds[9130010001] ?? 0).toBe(0);
    });

    it('keeps an unreachable ascension need at its own tier when T1 was never a listed need', () => {
      const engine = new SynthesisEngine();
      // 24 of the 25 T1 that one T3 costs — one short, so the craft never happens.
      const fwd = engine.forward({ 9130020001: 24 }, tieredMaterials, { 9130020003: 1 }, db);
      const back = engine.backward(fwd.updatedInventory, tieredMaterials, fwd.effectiveShortages);

      expect(back.finalNeeds[9130020003]).toBe(1);
      /**
       * Pre-existing engine limitation, made more visible by DNA's 25:1 T1->T3
       * span: backward() only writes finalNeeds for game_ids that were already
       * keys in the shortages it was given, so the single missing T1 is never
       * surfaced as "farm 1 more T1". It only bites when a goal needs a high
       * tier without needing any lower tier of the same chain.
       */
      expect(back.finalNeeds[9130020001]).toBeUndefined();
      // Nothing is silently eaten — the partial craft is rolled back into T1.
      expect(fwd.updatedInventory[9130020001]).toBe(24);
      expect(fwd.updatedInventory[9130020002]).toBe(0);
    });

    it('rolls talent T1 up to T3 at 3:1 per step', () => {
      const engine = new SynthesisEngine();
      // 1x T3 = 3x T2 = 9x T1.
      const fwd = engine.forward({ 9190010001: 9 }, tieredMaterials, { 9190010003: 1 }, db);

      expect(fwd.synthesisResults[9190010002].synthesized).toBe(3);
      expect(fwd.synthesisResults[9190010003].synthesized).toBe(1);
    });

    it('does not synthesize forgery while it is undeclared', () => {
      const engine = new SynthesisEngine();
      const fwd = engine.forward({ 9120010001: 50 }, tieredMaterials, { 9120010002: 5 }, db);
      expect(fwd.synthesisResults[9120010002]).toBeUndefined();
    });
  });
});
