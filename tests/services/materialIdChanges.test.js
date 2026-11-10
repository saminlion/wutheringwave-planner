import { describe, it, expect } from 'vitest';
import { diffMaterialIds, reportMaterialIdChanges } from '../../scripts/lib/materialIdChanges.js';

const mats = (entries) => ({ mastery: Object.fromEntries(entries.map(([key, id, label]) => [key, { game_id: id, label }])) });

describe('sync: material id changes', () => {
  it('reports a renumbered material by its label (the Perseverance case)', () => {
    const before = mats([['mark', 5140010039, 'Mark of Perseverance']]);
    const after = mats([['mark', 5140010040, 'Mark of Perseverance']]);
    expect(diffMaterialIds(before, after)).toEqual({
      renumbered: ['"Mark of Perseverance": 5140010039 → 5140010040'],
      removed: [],
    });
  });

  it('reports a material that disappeared, and stays quiet for additions', () => {
    const before = mats([['a', 1, 'A'], ['b', 2, 'B']]);
    const after = mats([['a', 1, 'A'], ['c', 3, 'C']]);
    expect(diffMaterialIds(before, after)).toEqual({ renumbered: [], removed: ['"B": 2'] });
  });

  it('only logs — returns the count and never throws', () => {
    const lines = [];
    const n = reportMaterialIdChanges('endfield', mats([['m', 1, 'M']]), mats([['m', 2, 'M']]), (l) => lines.push(l));
    expect(n).toBe(1);
    expect(lines[0]).toContain('1 → 2');
  });
});
