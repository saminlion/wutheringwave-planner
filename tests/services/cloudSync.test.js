import { describe, it, expect, vi } from 'vitest';
import {
  buildSnapshot,
  hashSnapshot,
  decideAction,
  parsePayload,
} from '@/services/cloudSync';

// The router pulls in every view; the sync helpers under test never navigate.
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('@/services/googleDrive', () => ({}));

function fakeStorage(entries) {
  return { getItem: (key) => (key in entries ? entries[key] : null) };
}

describe('buildSnapshot', () => {
  it('keeps synced keys as raw strings and drops per-device view state', () => {
    const storage = fakeStorage({
      gameplanner_goals_ww: '[1]',
      gameplanner_inventory_ww: '{"a":3}',
      gameplanner_theme: '"dark"',
      gameplanner_current_game: 'ww',
    });
    const snapshot = buildSnapshot(storage, Object.keys({
      gameplanner_inventory_ww: 1, gameplanner_theme: 1, gameplanner_goals_ww: 1, gameplanner_current_game: 1,
    }));

    expect(snapshot).toEqual({ gameplanner_goals_ww: '[1]', gameplanner_inventory_ww: '{"a":3}' });
  });
});

describe('hashSnapshot', () => {
  it('ignores key order but not values', () => {
    const a = hashSnapshot({ x: '1', y: '2' });
    expect(hashSnapshot({ y: '2', x: '1' })).toBe(a);
    expect(hashSnapshot({ x: '1', y: '3' })).not.toBe(a);
  });
});

describe('decideAction', () => {
  const file = { id: 'f', modifiedTime: '2026-11-05T00:00:00Z' };
  const synced = { syncedHash: 'h1', cloudModifiedTime: file.modifiedTime };

  it('uploads when Drive has no file yet and there is local data', () => {
    expect(decideAction({ cloudFile: null, meta: null, localHash: 'h', hasLocalData: true })).toBe('upload');
    expect(decideAction({ cloudFile: null, meta: null, localHash: 'h', hasLocalData: false })).toBe('none');
  });

  it('first sync: an empty device takes Drive, a device with data must ask', () => {
    expect(decideAction({ cloudFile: file, meta: null, localHash: 'h', hasLocalData: false })).toBe('download');
    expect(decideAction({ cloudFile: file, meta: { user: {} }, localHash: 'h', hasLocalData: true })).toBe('conflict');
  });

  it('copies whichever single side changed', () => {
    expect(decideAction({ cloudFile: file, meta: synced, localHash: 'h1', hasLocalData: true })).toBe('none');
    expect(decideAction({ cloudFile: file, meta: synced, localHash: 'h2', hasLocalData: true })).toBe('upload');
    expect(decideAction({
      cloudFile: { ...file, modifiedTime: '2026-11-06T00:00:00Z' }, meta: synced, localHash: 'h1', hasLocalData: true,
    })).toBe('download');
  });

  it('never overwrites when both sides changed', () => {
    expect(decideAction({
      cloudFile: { ...file, modifiedTime: '2026-11-06T00:00:00Z' }, meta: synced, localHash: 'h2', hasLocalData: true,
    })).toBe('conflict');
  });
});

describe('parsePayload', () => {
  it('accepts only string values under synced gameplanner_ keys', () => {
    expect(parsePayload({
      version: 1,
      data: {
        gameplanner_goals_ww: '[]',
        gameplanner_theme: '"dark"',
        other_app_key: 'x',
        gameplanner_bad: { not: 'a string' },
      },
    })).toEqual({ gameplanner_goals_ww: '[]' });
  });

  it('rejects files that are not sync payloads', () => {
    expect(parsePayload(null)).toBeNull();
    expect(parsePayload({ version: 1 })).toBeNull();
  });
});
