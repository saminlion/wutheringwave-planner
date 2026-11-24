import { describe, it, expect, vi, afterEach } from 'vitest';
import { uniqueKey, isUnreleased } from '../../scripts/lib/uniqueKey.js';

afterEach(() => vi.restoreAllMocks());

const quietWarn = () => vi.spyOn(console, 'warn').mockImplementation(() => {});
const released = (game_id) => ({ game_id, type: 'sword' });
const unreleased = (game_id) => ({ game_id, type: 'unknown' });

describe('uniqueKey (sync)', () => {
  it('keeps every row when names repeat: five "Weapon" rows stay five', () => {
    quietWarn();
    const result = {};
    for (const id of [115, 116, 117, 118, 119]) result[uniqueKey(result, 'weapon', unreleased(id), 'weapon')] = unreleased(id);

    expect(Object.keys(result)).toEqual(['weapon', 'weapon_116', 'weapon_117', 'weapon_118', 'weapon_119']);
    expect(Object.values(result).map((w) => w.game_id)).toEqual([115, 116, 117, 118, 119]);
  });

  it('does not warn when both clashing rows are unreleased placeholders', () => {
    const warn = quietWarn();
    const result = {};
    for (const id of [115, 116, 117]) result[uniqueKey(result, 'weapon', unreleased(id), 'weapon')] = unreleased(id);
    expect(warn).not.toHaveBeenCalled();
  });

  it('still warns when a released row is involved', () => {
    const warn = quietWarn();
    uniqueKey({ sword: released(1) }, 'sword', released(2), 'weapon');
    uniqueKey({ sword: released(1) }, 'sword', unreleased(3), 'weapon');
    uniqueKey({ sword: unreleased(4) }, 'sword', released(5), 'weapon');
    expect(warn).toHaveBeenCalledTimes(3);
  });

  it('leaves unique keys alone and does not warn', () => {
    const warn = quietWarn();
    expect(uniqueKey({ a: released(1) }, 'b', released(2))).toBe('b');
    expect(warn).not.toHaveBeenCalled();
  });

  it('the same game_id listed twice still overwrites (same item, no duplicate)', () => {
    const warn = quietWarn();
    expect(uniqueKey({ weapon: released(7) }, 'weapon', released('7'))).toBe('weapon');
    expect(warn).not.toHaveBeenCalled();
  });

  it('never returns a key that is already taken', () => {
    quietWarn();
    const target = { weapon: released(1), weapon_2: released(9) };
    expect(uniqueKey(target, 'weapon', released(2))).toBe('weapon_2_2');
  });

  it('isUnreleased reads the unknown marker on weapons and characters', () => {
    expect(isUnreleased({ type: 'unknown' })).toBe(true);
    expect(isUnreleased({ element: 'Unknown', weapon: 'sword' })).toBe(true);
    expect(isUnreleased({ weapon: 'unknown' })).toBe(true);
    expect(isUnreleased({ type: 'sword', element: 'fusion' })).toBe(false);
  });
});
