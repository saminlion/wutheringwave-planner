import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMaterial, SUPPORTED_KEYS } from '@/games/mongilstardive/materialProcessor';

vi.mock('@/services/materialHelper/dbUtils', () => ({
  findMaterial: vi.fn(),
  getMaterialField: vi.fn((m, f) => m?.[f] ?? null),
}));

vi.mock('@/store/game', () => ({
  useGameStore: vi.fn(() => ({
    getData: vi.fn((type) => {
      if (type === 'materials') {
        return {
          mastery: { '8190010001': { game_id: 8190010001 } },
          forgery: {},
        };
      }
      return null;
    }),
  })),
}));

import { findMaterial } from '@/services/materialHelper/dbUtils';

describe('Mongil StarDive MaterialProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMaterial.mockReturnValue({ game_id: 8120010001 });
  });

  it('includes expected SUPPORTED_KEYS', () => {
    expect(SUPPORTED_KEYS).toContain('forgery_skill');
    expect(SUPPORTED_KEYS).toContain('forgery_ascension');
    expect(SUPPORTED_KEYS).toContain('forgery_weapon');
    expect(SUPPORTED_KEYS).toContain('mastery');
  });

  it('processes forgery_skill with character subCategory', () => {
    const materials = {};
    const result = processMaterial(materials, 'forgery_skill', [10, 1], { forgery_skill: 'sinew' });
    expect(result).toBe(true);
    expect(findMaterial).toHaveBeenCalledWith('forgery', 'sinew', 1);
    expect(materials[8120010001]).toBe(10);
  });

  it('processes forgery_ascension with character subCategory', () => {
    const materials = {};
    const result = processMaterial(materials, 'forgery_ascension', [120, 2], { forgery_ascension: 'fighter' });
    expect(result).toBe(true);
    expect(findMaterial).toHaveBeenCalledWith('forgery', 'fighter', 2);
  });

  it('processes forgery_weapon using weapon.forgery subCategory', () => {
    const materials = {};
    const result = processMaterial(materials, 'forgery_weapon', [4, 3], { forgery: 'chain' });
    expect(result).toBe(true);
    expect(findMaterial).toHaveBeenCalledWith('forgery', 'chain', 3);
  });

  it('processes mastery as single item', () => {
    const materials = {};
    const result = processMaterial(materials, 'mastery', 1, {});
    expect(result).toBe(true);
    expect(materials[8190010001]).toBe(1);
  });

  it('returns false for unknown keys', () => {
    const result = processMaterial({}, 'common', [5, 1], {});
    expect(result).toBe(false);
  });
});
