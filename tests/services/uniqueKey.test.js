import { describe, it, expect, vi, afterEach } from 'vitest';
import { uniqueKey } from '../../scripts/lib/uniqueKey.js';

afterEach(() => vi.restoreAllMocks());

describe('uniqueKey (sync)', () => {
  it('keeps every row when names repeat: five "Weapon" rows stay five', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = {};
    for (const id of [115, 116, 117, 118, 119]) result[uniqueKey(result, 'weapon', id, 'weapon')] = { game_id: id };

    expect(Object.keys(result)).toEqual(['weapon', 'weapon_116', 'weapon_117', 'weapon_118', 'weapon_119']);
    expect(Object.values(result).map((w) => w.game_id)).toEqual([115, 116, 117, 118, 119]);
    expect(warn).toHaveBeenCalledTimes(4);
  });

  it('leaves unique keys alone and does not warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(uniqueKey({ a: { game_id: 1 } }, 'b', 2)).toBe('b');
    expect(warn).not.toHaveBeenCalled();
  });

  it('the same game_id listed twice still overwrites (same item, no duplicate)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(uniqueKey({ weapon: { game_id: 7 } }, 'weapon', '7')).toBe('weapon');
    expect(warn).not.toHaveBeenCalled();
  });

  it('never returns a key that is already taken', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const target = { weapon: { game_id: 1 }, weapon_2: { game_id: 9 } };
    expect(uniqueKey(target, 'weapon', 2)).toBe('weapon_2_2');
  });
});
