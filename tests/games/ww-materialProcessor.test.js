import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMaterial, SUPPORTED_KEYS } from '@/games/wutheringwave/materialProcessor';

// Mock dbUtils
vi.mock('@/services/materialHelper/dbUtils', () => ({
  findMaterial: vi.fn((type, identifier, tier, useId) => {
    // Mock material lookup for testing
    if (type === 'common' && identifier === 'whisperin_core' && tier === 2) {
      return { game_id: 41101002, label: 'MF Whisperin Core' };
    }
    if (type === 'forgery' && identifier === 'cadence_seed' && tier === 3) {
      return { game_id: 41201003, label: 'HF Cadence Seed' };
    }
    if (type === 'ascension' && identifier === '41400001' && useId) {
      return { game_id: 41400001, label: 'Ascension Material' };
    }
    if (type === 'boss' && identifier === '41500001' && useId) {
      return { game_id: 41500001, label: 'Boss Material' };
    }
    if (type === 'weekly' && identifier === '41600001' && useId) {
      return { game_id: 41600001, label: 'Weekly Boss Material' };
    }
    return null;
  }),
  getMaterialField: vi.fn((material, field) => {
    if (material && material[field]) {
      return material[field];
    }
    return null;
  }),
}));

describe('WW MaterialProcessor', () => {
  describe('SUPPORTED_KEYS', () => {
    it('should include WW-specific material keys', () => {
      expect(SUPPORTED_KEYS).toContain('common');
      expect(SUPPORTED_KEYS).toContain('forgery');
      expect(SUPPORTED_KEYS).toContain('ascension');
      expect(SUPPORTED_KEYS).toContain('boss');
      expect(SUPPORTED_KEYS).toContain('weeklyBoss');
    });

    it('should not include Endfield-specific keys', () => {
      expect(SUPPORTED_KEYS).not.toContain('proto_asc');
      expect(SUPPORTED_KEYS).not.toContain('bolete');
      expect(SUPPORTED_KEYS).not.toContain('special');
    });
  });

  describe('processMaterial', () => {
    let materials;
    let characterInfo;

    beforeEach(() => {
      materials = {};
      characterInfo = {
        common: 'whisperin_core',
        forgery: 'cadence_seed',
        ascension: '41400001',
        boss: '41500001',
        weeklyBoss: '41600001',
      };
    });

    it('should process common tiered material', () => {
      const handled = processMaterial(materials, 'common', [5, 2], characterInfo);

      expect(handled).toBe(true);
      expect(materials[41101002]).toBe(5);
    });

    it('should process forgery tiered material', () => {
      const handled = processMaterial(materials, 'forgery', [10, 3], characterInfo);

      expect(handled).toBe(true);
      expect(materials[41201003]).toBe(10);
    });

    it('should process ascension material', () => {
      const handled = processMaterial(materials, 'ascension', 3, characterInfo);

      expect(handled).toBe(true);
      expect(materials[41400001]).toBe(3);
    });

    it('should process boss material', () => {
      const handled = processMaterial(materials, 'boss', 4, characterInfo);

      expect(handled).toBe(true);
      expect(materials[41500001]).toBe(4);
    });

    it('should process weeklyBoss material', () => {
      const handled = processMaterial(materials, 'weeklyBoss', 2, characterInfo);

      expect(handled).toBe(true);
      expect(materials[41600001]).toBe(2);
    });

    it('should return false for unsupported keys', () => {
      const handled = processMaterial(materials, 'credit', 1000, characterInfo);

      expect(handled).toBe(false);
    });

    it('should accumulate quantities for same material', () => {
      processMaterial(materials, 'common', [5, 2], characterInfo);
      processMaterial(materials, 'common', [3, 2], characterInfo);

      expect(materials[41101002]).toBe(8);
    });
  });
});
