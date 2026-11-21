import { describe, it, expect } from 'vitest';
import {
  groupMaterialsByVersion, isOpenByDefault, isSharedVersion, NO_VERSION,
} from '@/services/inventoryGroups';
import wwMaterials from '@/games/wutheringwave/data/materials.json';

const mat = (game_id, Category, SubCategory, version) => ({ game_id, Category, SubCategory, version });
const ids = (group) =>
  Object.values(group.categories).flatMap((subs) => Object.values(subs)).flat().map((m) => m.game_id);

describe('groupMaterialsByVersion', () => {
  it('orders versions newest first, numeric per segment', () => {
    const groups = groupMaterialsByVersion([
      mat(1, 'common', 'a', '1.0'),
      mat(2, 'common', 'a', '2.10'),
      mat(4, 'common', 'b', '2.9'),
      mat(5, 'boss', 'boss', ' 2.10 '),
    ]);
    expect(groups.map((g) => g.version)).toEqual(['2.10', '2.9', '1.0']);
    expect(ids(groups[0])).toEqual([2, 5]);
  });

  it('repeats shared materials (blank, 통합, all) in every version, in data order', () => {
    const groups = groupMaterialsByVersion([
      mat('credit', 'credit', 'credit'),
      mat(1, 'common', 'a', '1'),
      mat('exp', 'player_exp', 'player_exp', '통합'),
      mat(2, 'common', 'a', '2'),
      mat('boss', 'boss', 'boss', 'All'),
    ]);
    expect(groups.map((g) => g.version)).toEqual(['2', '1']);
    expect(ids(groups[0])).toEqual(['credit', 'exp', 2, 'boss']);
    expect(ids(groups[1])).toEqual(['credit', 1, 'exp', 'boss']);
    expect(groups[1].count).toBe(4);
  });

  it('returns one header-less group when no material has a version', () => {
    const groups = groupMaterialsByVersion([mat(1, 'common', 'a'), mat(2, 'boss', 'boss', '통합')]);
    expect(groups).toEqual([{ version: NO_VERSION, count: 2, categories: expect.any(Object) }]);
    expect(ids(groups[0])).toEqual([1, 2]);
  });

  it('opens only the newest version by default', () => {
    const groups = groupMaterialsByVersion([mat(1, 'c', 's', '1.0'), mat(2, 'c', 's', '2.0')]);
    expect(isOpenByDefault(groups, '2.0')).toBe(true);
    expect(isOpenByDefault(groups, '1.0')).toBe(false);
  });

  it('treats blank / 통합 / 공통 / all / common as shared', () => {
    for (const v of [undefined, null, '', ' ', '통합', '공통', 'ALL', 'Common']) expect(isSharedVersion(v)).toBe(true);
    for (const v of ['1', '1.0', 1]) expect(isSharedVersion(v)).toBe(false);
  });
});

describe('real WW data', () => {
  const all = Object.values(wwMaterials).flatMap((c) => Object.values(c));
  const groups = groupMaterialsByVersion(all);
  const shared = all.filter((m) => isSharedVersion(m.version));

  it('puts every material in at least one group and credits in every group', () => {
    const seen = new Set(groups.flatMap(ids));
    expect(all.filter((m) => !seen.has(m.game_id))).toEqual([]);
    const credit = wwMaterials.credit && Object.values(wwMaterials.credit)[0];
    if (credit && isSharedVersion(credit.version)) {
      for (const g of groups) expect(ids(g)).toContain(credit.game_id);
    }
  });

  it('each group = shared materials + its own version', () => {
    for (const g of groups) {
      const own = all.filter((m) => !isSharedVersion(m.version) && String(m.version).trim() === g.version);
      expect(g.count).toBe(shared.length + own.length);
    }
  });
});
