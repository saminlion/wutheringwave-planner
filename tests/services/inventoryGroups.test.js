import { describe, it, expect } from 'vitest';
import { groupMaterialsByVersion, isOpenByDefault, NO_VERSION } from '@/services/inventoryGroups';

const mat = (game_id, Category, SubCategory, version) => ({ game_id, Category, SubCategory, version });

describe('groupMaterialsByVersion', () => {
  it('puts unversioned materials first, then versions newest first (numeric per segment)', () => {
    const groups = groupMaterialsByVersion([
      mat(1, 'common', 'a', '1.0'),
      mat(2, 'common', 'a', '2.10'),
      mat(3, 'credit', 'credit'),
      mat(4, 'common', 'b', '2.9'),
      mat(5, 'boss', 'boss', ' 2.10 '),
    ]);
    expect(groups.map((g) => g.version)).toEqual([NO_VERSION, '2.10', '2.9', '1.0']);
    expect(groups.find((g) => g.version === '2.10').count).toBe(2);
  });

  it('keeps Category → SubCategory nesting inside each version', () => {
    const [group] = groupMaterialsByVersion([
      mat(1, 'common', 'a', '1.0'),
      mat(2, 'common', 'a', '1.0'),
      mat(3, 'common', 'b', '1.0'),
    ]);
    expect(Object.keys(group.categories.common)).toEqual(['a', 'b']);
    expect(group.categories.common.a.map((m) => m.game_id)).toEqual([1, 2]);
  });

  it('returns a single unversioned group when the sheet has no Version values', () => {
    const groups = groupMaterialsByVersion([mat(1, 'common', 'a'), mat(2, 'boss', 'boss')]);
    expect(groups).toHaveLength(1);
    expect(groups[0].version).toBe(NO_VERSION);
  });
});

describe('isOpenByDefault', () => {
  it('opens the base group and the newest version only', () => {
    const groups = groupMaterialsByVersion([
      mat(1, 'c', 's'),
      mat(2, 'c', 's', '1.0'),
      mat(3, 'c', 's', '2.0'),
    ]);
    expect(isOpenByDefault(groups, NO_VERSION)).toBe(true);
    expect(isOpenByDefault(groups, '2.0')).toBe(true);
    expect(isOpenByDefault(groups, '1.0')).toBe(false);
  });
});
