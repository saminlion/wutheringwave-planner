import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMaterial, SUPPORTED_KEYS } from '@/games/gfl2/materialProcessor';

// Mock dbUtils
vi.mock('@/services/materialHelper/dbUtils', () => ({
  findMaterial: vi.fn((type, identifier, tier) => {
    // Forgery: stock_boost_bar
    if (type === 'forgery' && identifier === 'stock_boost_bar' && tier === 1) {
      return { game_id: '6120010001', label: 'Stock Boost Bar T1' };
    }
    if (type === 'forgery' && identifier === 'stock_boost_bar' && tier === 2) {
      return { game_id: '6120010002', label: 'Stock Boost Bar T2' };
    }
    if (type === 'forgery' && identifier === 'stock_boost_bar' && tier === 3) {
      return { game_id: '6120010003', label: 'Stock Boost Bar T3' };
    }
    if (type === 'forgery' && identifier === 'stock_boost_bar' && tier === 4) {
      return { game_id: '6120010004', label: 'Stock Boost Bar T4' };
    }
    // Forgery: transcription_conductor
    if (type === 'forgery' && identifier === 'transcription_conductor' && tier === 1) {
      return { game_id: '6120020001', label: 'Inert Metallic Drip' };
    }
    if (type === 'forgery' && identifier === 'transcription_conductor' && tier === 5) {
      return { game_id: '6120020005', label: 'Metallic Drip T5' };
    }
    // Rare material
    if (type === 'rare_material' && identifier === 'rare_material') {
      return { game_id: '6130010001', label: 'Basic Info Core' };
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

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('GFL2 MaterialProcessor', () => {
  describe('SUPPORTED_KEYS', () => {
    it('should include GFL2-specific material keys', () => {
      expect(SUPPORTED_KEYS).toContain('forgery_stock_boost_bar');
      expect(SUPPORTED_KEYS).toContain('forgery_transcription_conductor');
      expect(SUPPORTED_KEYS).toContain('rare_material');
      expect(SUPPORTED_KEYS).toContain('doll_exp');
    });

    it('should not include WW-specific keys', () => {
      expect(SUPPORTED_KEYS).not.toContain('common');
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
        game_id: '6205010001',
        rarity: 5,
        element: 'burn',
      };
    });

    it('should process single-tier forgery_stock_boost_bar', () => {
      const handled = processMaterial(materials, 'forgery_stock_boost_bar', [4, 1], characterInfo);

      expect(handled).toBe(true);
      expect(materials['6120010001']).toBe(4);
    });

    it('should process multi-tier forgery_stock_boost_bar', () => {
      const handled = processMaterial(materials, 'forgery_stock_boost_bar', [[6, 1], [8, 2]], characterInfo);

      expect(handled).toBe(true);
      expect(materials['6120010001']).toBe(6);
      expect(materials['6120010002']).toBe(8);
    });

    it('should process forgery_transcription_conductor', () => {
      const handled = processMaterial(materials, 'forgery_transcription_conductor', [20, 1], characterInfo);

      expect(handled).toBe(true);
      expect(materials['6120020001']).toBe(20);
    });

    it('should process rare_material', () => {
      const handled = processMaterial(materials, 'rare_material', 3, characterInfo);

      expect(handled).toBe(true);
      expect(materials['6130010001']).toBe(3);
    });

    it('should process doll_exp as numeric total', () => {
      const handled = processMaterial(materials, 'doll_exp', 5224, characterInfo);

      expect(handled).toBe(true);
      expect(materials['doll_exp']).toBe(5224);
    });

    it('should accumulate doll_exp across multiple calls', () => {
      processMaterial(materials, 'doll_exp', 5224, characterInfo);
      processMaterial(materials, 'doll_exp', 21084, characterInfo);

      expect(materials['doll_exp']).toBe(26308);
    });

    it('should return false for unsupported keys', () => {
      const handled = processMaterial(materials, 'credit', 1000, characterInfo);
      expect(handled).toBe(false);
    });

    it('should accumulate quantities for same material', () => {
      processMaterial(materials, 'forgery_stock_boost_bar', [4, 1], characterInfo);
      processMaterial(materials, 'forgery_stock_boost_bar', [6, 1], characterInfo);

      expect(materials['6120010001']).toBe(10);
    });

    it('should handle 30A multi-tier cost correctly', () => {
      // 30A: T1:6 + T2:8
      processMaterial(materials, 'forgery_stock_boost_bar', [[6, 1], [8, 2]], characterInfo);

      expect(materials['6120010001']).toBe(6);
      expect(materials['6120010002']).toBe(8);
    });

    it('should handle 40A multi-tier cost correctly', () => {
      // 40A: T2:16 + T3:8
      processMaterial(materials, 'forgery_stock_boost_bar', [[16, 2], [8, 3]], characterInfo);

      expect(materials['6120010002']).toBe(16);
      expect(materials['6120010003']).toBe(8);
    });

    it('should handle 50A multi-tier cost correctly', () => {
      // 50A: T3:12 + T4:5
      processMaterial(materials, 'forgery_stock_boost_bar', [[12, 3], [5, 4]], characterInfo);

      expect(materials['6120010003']).toBe(12);
      expect(materials['6120010004']).toBe(5);
    });
  });
});
