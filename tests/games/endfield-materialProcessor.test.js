import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMaterial, SUPPORTED_KEYS } from '@/games/endfield/materialProcessor';

// Mock dbUtils
vi.mock('@/services/materialHelper/dbUtils', () => ({
  findMaterial: vi.fn((type, identifier, tier, useId) => {
    // Mock material lookup for testing
    // Forgery tiered materials
    if (type === 'forgery' && identifier === 'proto_asc' && tier === 2) {
      return { game_id: 51201002, label: 'Proto Asc Material Tier 2' };
    }
    if (type === 'forgery' && identifier === 'proto_skill' && tier === 3) {
      return { game_id: 51201103, label: 'Proto Skill Material Tier 3' };
    }
    if (type === 'forgery' && identifier === 'cast_die' && tier === 2) {
      return { game_id: 51201202, label: 'Cast Die Material Tier 2' };
    }
    // Ascension tiered materials (by SubCategory)
    if (type === 'ascension' && identifier === 'bolete_alpha' && tier === 2) {
      return { game_id: 51301002, label: 'Bolete Alpha Tier 2' };
    }
    if (type === 'ascension' && identifier === 'odendra_beta' && tier === 3) {
      return { game_id: 51301103, label: 'Odendra Beta Tier 3' };
    }
    // Tier 5 is ambiguous: multiple variants share a SubCategory. A SubCategory
    // lookup returns the WRONG (first) variant, which the processor must NOT use.
    if (type === 'ascension' && identifier === 'bolete_alpha' && tier === 5) {
      return { game_id: 51301005, label: 'Bolete Alpha Tier 5 (first variant)' };
    }
    return null;
  }),
  getMaterialField: vi.fn((material, field) => {
    if (material && material[field]) {
      return material[field];
    }
    return null;
  }),
  getMaterialFieldById: vi.fn((id, field) => {
    // Mock lookup for character-specific materials
    if (id === '51301001' && field === 'SubCategory') {
      return 'bolete_alpha';
    }
    if (id === '51301101' && field === 'SubCategory') {
      return 'odendra_beta';
    }
    // Character-specific tier-5 material: exact game_id must be used directly
    if (id === '51301009') {
      if (field === 'SubCategory') return 'bolete_alpha';
      if (field === 'tier') return 5;
    }
    return null;
  }),
}));

describe('Endfield MaterialProcessor', () => {
  describe('SUPPORTED_KEYS', () => {
    it('should include Endfield-specific material keys', () => {
      expect(SUPPORTED_KEYS).toContain('proto_asc');
      expect(SUPPORTED_KEYS).toContain('proto_skill');
      expect(SUPPORTED_KEYS).toContain('cast_die');
      expect(SUPPORTED_KEYS).toContain('bolete');
      expect(SUPPORTED_KEYS).toContain('odendra');
      expect(SUPPORTED_KEYS).toContain('onyx');
      expect(SUPPORTED_KEYS).toContain('special');
      expect(SUPPORTED_KEYS).toContain('perseverance');
    });

    it('should not include WW-specific keys', () => {
      expect(SUPPORTED_KEYS).not.toContain('common');
      expect(SUPPORTED_KEYS).not.toContain('forgery');
      expect(SUPPORTED_KEYS).not.toContain('ascension');
      expect(SUPPORTED_KEYS).not.toContain('boss');
    });
  });

  describe('processMaterial', () => {
    let materials;
    let characterInfo;

    beforeEach(() => {
      materials = {};
      characterInfo = {
        bolete: '51301001',    // game_id -> SubCategory lookup
        odendra: '51301101',
        onyx: '51301201',
        special: '51400001',   // direct game_id
        mastery_basic_attack: 51500001,   // flat per-skill mastery fields
        mastery_battle_skill: 51500002,
        mastery_combo_skill: 51500001,
        mastery_ultimate: 51500002,
      };
    });

    it('should process proto_asc tiered material', () => {
      const handled = processMaterial(materials, 'proto_asc', [10, 2], characterInfo);

      expect(handled).toBe(true);
      expect(materials[51201002]).toBe(10);
    });

    it('should process proto_skill tiered material', () => {
      const handled = processMaterial(materials, 'proto_skill', [5, 3], characterInfo);

      expect(handled).toBe(true);
      expect(materials[51201103]).toBe(5);
    });

    it('should process cast_die tiered material', () => {
      const handled = processMaterial(materials, 'cast_die', [8, 2], characterInfo);

      expect(handled).toBe(true);
      expect(materials[51201202]).toBe(8);
    });

    it('should process bolete character-specific material', () => {
      const handled = processMaterial(materials, 'bolete', [3, 2], characterInfo);

      expect(handled).toBe(true);
      expect(materials[51301002]).toBe(3);
    });

    it('should process odendra character-specific material', () => {
      const handled = processMaterial(materials, 'odendra', [4, 3], characterInfo);

      expect(handled).toBe(true);
      expect(materials[51301103]).toBe(4);
    });

    it('should use exact game_id for character-specific tier-5 ascension material', () => {
      // The character's tier-5 material (51301009) shares its SubCategory with other
      // tier-5 variants, so a SubCategory lookup would return the wrong one (51301005).
      const infoT5 = { ...characterInfo, bolete: '51301009' };
      const handled = processMaterial(materials, 'bolete', [8, 5], infoT5);

      expect(handled).toBe(true);
      expect(materials['51301009']).toBe(8);       // exact character material used
      expect(materials[51301005]).toBeUndefined(); // ambiguous first variant NOT used
    });

    it('should process special material directly', () => {
      const handled = processMaterial(materials, 'special', 2, characterInfo);

      expect(handled).toBe(true);
      expect(materials['51400001']).toBe(2);
    });

    it('should process perseverance as the fixed Mark of Perseverance material', () => {
      const handled = processMaterial(materials, 'perseverance', 2, characterInfo);

      expect(handled).toBe(true);
      expect(materials[5140010039]).toBe(2);
    });

    it('should use the same perseverance material regardless of skill', () => {
      const infoWithSkill = { ...characterInfo, _masterySkill: 'battle_skill' };
      processMaterial(materials, 'perseverance', 1, infoWithSkill);

      expect(materials[5140010039]).toBe(1);
    });

    it('should accumulate perseverance quantities', () => {
      processMaterial(materials, 'perseverance', 1, characterInfo);
      processMaterial(materials, 'perseverance', 3, characterInfo);

      expect(materials[5140010039]).toBe(4);
    });

    it('should return false for unsupported keys', () => {
      const handled = processMaterial(materials, 'credit', 1000, characterInfo);

      expect(handled).toBe(false);
    });

    it('should accumulate quantities for same material', () => {
      processMaterial(materials, 'proto_asc', [10, 2], characterInfo);
      processMaterial(materials, 'proto_asc', [5, 2], characterInfo);

      expect(materials[51201002]).toBe(15);
    });
  });
});
