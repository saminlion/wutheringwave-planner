import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMaterial, SUPPORTED_KEYS } from '@/games/nte/materialProcessor';

vi.mock('@/services/materialHelper/dbUtils', () => ({
  findMaterial: vi.fn((type, identifier, tier, useId) => {
    // Common: whispers
    if (type === 'common' && identifier === 'whispers' && tier === 1) {
      return { game_id: '7110010001', label: 'Lost Whispers' };
    }
    if (type === 'common' && identifier === 'whispers' && tier === 2) {
      return { game_id: '7110010002', label: 'Obscure Whispers' };
    }
    if (type === 'common' && identifier === 'whispers' && tier === 3) {
      return { game_id: '7110010003', label: 'Paradoxical Whispers' };
    }
    // Forgery: bird
    if (type === 'forgery' && identifier === 'bird' && tier === 1) {
      return { game_id: '7120010001', label: "Nestling's Longing" };
    }
    if (type === 'forgery' && identifier === 'bird' && tier === 2) {
      return { game_id: '7120010002', label: "Dove's Flutter" };
    }
    // Boss: direct lookup
    if (type === 'boss' && useId) {
      return { game_id: identifier };
    }
    // WeeklyBoss: direct lookup
    if (type === 'weeklyBoss' && useId) {
      return { game_id: identifier };
    }
    return null;
  }),
  getMaterialField: vi.fn((material, field) => material?.[field] ?? null),
}));

vi.mock('@/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('NTE MaterialProcessor', () => {
  describe('SUPPORTED_KEYS', () => {
    it('should include all NTE material keys', () => {
      expect(SUPPORTED_KEYS).toContain('common');
      expect(SUPPORTED_KEYS).toContain('forgery');
      expect(SUPPORTED_KEYS).toContain('boss');
      expect(SUPPORTED_KEYS).toContain('weeklyBoss');
    });
    it('should not include ascension (now handled as common)', () => {
      expect(SUPPORTED_KEYS).not.toContain('ascension');
    });
  });

  describe('processMaterial', () => {
    let materials;
    let characterInfo;

    beforeEach(() => {
      materials = {};
      characterInfo = {
        game_id: '7820100001',
        rarity: 6,
        element: 'incantation',
        weapon_type: 'gas',
        common: 'whispers',
        forgery: 'bird',
        boss: '7140010001',
        weeklyBoss: '7150010001',
      };
    });

    it('should process common T1 (whispers)', () => {
      const handled = processMaterial(materials, 'common', [5, 1], characterInfo);
      expect(handled).toBe(true);
      expect(materials['7110010001']).toBe(5);
    });

    it('should process common T2', () => {
      const handled = processMaterial(materials, 'common', [12, 2], characterInfo);
      expect(handled).toBe(true);
      expect(materials['7110010002']).toBe(12);
    });

    it('should process common T3', () => {
      const handled = processMaterial(materials, 'common', [12, 3], characterInfo);
      expect(handled).toBe(true);
      expect(materials['7110010003']).toBe(12);
    });

    it('should process forgery T1 (bird)', () => {
      const handled = processMaterial(materials, 'forgery', [2, 1], characterInfo);
      expect(handled).toBe(true);
      expect(materials['7120010001']).toBe(2);
    });

    it('should process forgery T2', () => {
      const handled = processMaterial(materials, 'forgery', [3, 2], characterInfo);
      expect(handled).toBe(true);
      expect(materials['7120010002']).toBe(3);
    });

    it('should process boss (direct game_id)', () => {
      const handled = processMaterial(materials, 'boss', 2, characterInfo);
      expect(handled).toBe(true);
      expect(materials['7140010001']).toBe(2);
    });

    it('should process weeklyBoss (direct game_id)', () => {
      const handled = processMaterial(materials, 'weeklyBoss', 1, characterInfo);
      expect(handled).toBe(true);
      expect(materials['7150010001']).toBe(1);
    });

    it('should accumulate quantities for same material', () => {
      processMaterial(materials, 'boss', 2, characterInfo);
      processMaterial(materials, 'boss', 3, characterInfo);
      expect(materials['7140010001']).toBe(5);
    });

    it('should return false for unsupported keys (credit, player_exp, ascension)', () => {
      expect(processMaterial(materials, 'credit', 30000, characterInfo)).toBe(false);
      expect(processMaterial(materials, 'player_exp', 13650, characterInfo)).toBe(false);
      expect(processMaterial(materials, 'weapon_exp', 39000, characterInfo)).toBe(false);
      expect(processMaterial(materials, 'ascension', 5, characterInfo)).toBe(false);
    });
  });
});
