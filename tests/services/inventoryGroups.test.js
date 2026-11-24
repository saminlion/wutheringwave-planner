import { describe, it, expect } from 'vitest';
import { groupInventory, isOpenByDefault, isUnversioned, foldKey } from '@/services/inventoryGroups';
import wwMaterials from '@/games/wutheringwave/data/materials.json';

const mat = (game_id, Category, SubCategory, version) => ({ game_id, Category, SubCategory, version });
const idsOf = (subs) => Object.values(subs).flat().map((m) => m.game_id);
const allIds = (groups) =>
  groups.flatMap((g) => [...idsOf(g.base), ...g.versions.flatMap((f) => idsOf(f.subCategories))]);

describe('groupInventory', () => {
  it('folds by version only inside the categories that have versions', () => {
    const groups = groupInventory([
      mat('credit', 'credit', 'credit'),
      mat(1, 'common', 'ring', '1'),
      mat(2, 'common', 'exo', '2'),
      mat('boss1', 'boss', 'boss'),
      mat(3, 'forgery', 'helix', '1'),
    ]);
    const by = Object.fromEntries(groups.map((g) => [g.category, g]));

    expect(groups.map((g) => g.category)).toEqual(['credit', 'common', 'boss', 'forgery']);
    expect(by.credit.versions).toEqual([]);
    expect(idsOf(by.credit.base)).toEqual(['credit']);
    expect(by.boss.versions).toEqual([]);
    expect(by.common.versions.map((f) => f.version)).toEqual(['2', '1']);
    expect(by.forgery.versions.map((f) => f.version)).toEqual(['1']);
  });

  it('puts every material in exactly one place — nothing is repeated across versions', () => {
    const input = [
      mat('credit', 'credit', 'credit'),
      mat(1, 'common', 'ring', '1'),
      mat(2, 'common', 'exo', '2'),
      mat(9, 'common', 'misc', '통합'),
    ];
    expect(allIds(groupInventory(input)).sort()).toEqual(input.map((m) => m.game_id).sort());
  });

  it('versionless rows of a versioned category go above its folds, once', () => {
    const [common] = groupInventory([mat(1, 'common', 'ring', '1'), mat(9, 'common', 'misc'), mat(8, 'common', 'misc', 'All')]);
    expect(idsOf(common.base)).toEqual([9, 8]);
    expect(common.versions.map((f) => [f.version, f.count])).toEqual([['1', 1]]);
  });

  it('orders versions newest first, numeric per segment', () => {
    const [g] = groupInventory(['1.0', '2.10', '2.9', ' 2.10 '].map((v, i) => mat(i, 'common', 's', v)));
    expect(g.versions.map((f) => [f.version, f.count])).toEqual([['2.10', 2], ['2.9', 1], ['1.0', 1]]);
  });

  it('no versions anywhere → every category is a plain block', () => {
    const groups = groupInventory([mat(1, 'common', 'a'), mat(2, 'boss', 'b')]);
    expect(groups.every((g) => g.versions.length === 0)).toBe(true);
  });

  it('opens only each category\'s newest version by default; fold keys are per category', () => {
    const [g] = groupInventory([mat(1, 'common', 's', '1'), mat(2, 'common', 's', '3')]);
    expect(isOpenByDefault(g, '3')).toBe(true);
    expect(isOpenByDefault(g, '1')).toBe(false);
    expect(foldKey('common', '1')).not.toBe(foldKey('forgery', '1'));
  });

  it('treats blank / 통합 / 공통 / all / common as versionless', () => {
    for (const v of [undefined, null, '', ' ', '통합', '공통', 'ALL', 'Common']) expect(isUnversioned(v)).toBe(true);
    for (const v of ['1', '1.0', 1]) expect(isUnversioned(v)).toBe(false);
  });
});

describe('real WW data', () => {
  const all = Object.values(wwMaterials).flatMap((c) => Object.values(c));
  const groups = groupInventory(all);

  it('every material appears exactly once', () => {
    const ids = allIds(groups).map(String);
    expect(ids.length).toBe(all.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only categories whose materials carry a version get folds', () => {
    const versioned = new Set(all.filter((m) => !isUnversioned(m.version)).map((m) => m.Category));
    for (const g of groups) expect(g.versions.length > 0).toBe(versioned.has(g.category));
  });
});
