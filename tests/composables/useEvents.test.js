import { describe, it, expect } from 'vitest';
import { parseEventDate, packLanes, DEFAULT_UTC_OFFSET } from '@/composables/useEvents';

describe('parseEventDate', () => {
  it('parses date-only strings at midnight in the given offset', () => {
    expect(parseEventDate('2026-08-12', 8)).toBe(Date.UTC(2026, 7, 11, 16, 0, 0));
  });

  it('parses date + time', () => {
    expect(parseEventDate('2026-08-12 04:00', 8)).toBe(Date.UTC(2026, 7, 11, 20, 0, 0));
  });

  it('parses date + time with seconds', () => {
    expect(parseEventDate('2026-08-19 03:59:59', 8)).toBe(Date.UTC(2026, 7, 18, 19, 59, 59));
  });

  it('accepts the ISO "T" separator', () => {
    expect(parseEventDate('2026-08-12T04:00', 8)).toBe(parseEventDate('2026-08-12 04:00', 8));
  });

  it('defaults to server time (UTC+8) when no offset is given', () => {
    expect(parseEventDate('2026-08-12 04:00')).toBe(parseEventDate('2026-08-12 04:00', DEFAULT_UTC_OFFSET));
  });

  it('shifts correctly for a different offset', () => {
    // Same wall-clock time in UTC+0 is 8 hours later in absolute terms than UTC+8.
    const utc = parseEventDate('2026-08-12 04:00', 0);
    const cst = parseEventDate('2026-08-12 04:00', 8);
    expect(utc - cst).toBe(8 * 3600000);
  });

  it('passes through numbers unchanged', () => {
    expect(parseEventDate(1755000000000)).toBe(1755000000000);
  });

  it('returns null for blank or malformed input', () => {
    expect(parseEventDate('')).toBeNull();
    expect(parseEventDate(null)).toBeNull();
    expect(parseEventDate(undefined)).toBeNull();
    expect(parseEventDate('not a date')).toBeNull();
  });

  it('falls back to the default offset when utcOffset is not numeric', () => {
    expect(parseEventDate('2026-08-12 04:00', 'abc')).toBe(parseEventDate('2026-08-12 04:00', 8));
  });
});

describe('packLanes', () => {
  const evt = (start, end) => ({ start, end });

  it('keeps non-overlapping events in a single lane', () => {
    const { events, laneCount } = packLanes([evt(0, 10), evt(20, 30), evt(40, 50)]);
    expect(laneCount).toBe(1);
    expect(events.map((e) => e.lane)).toEqual([0, 0, 0]);
  });

  it('pushes overlapping events onto separate lanes', () => {
    const { events, laneCount } = packLanes([evt(0, 100), evt(10, 50), evt(20, 30)]);
    expect(laneCount).toBe(3);
    expect(events.map((e) => e.lane)).toEqual([0, 1, 2]);
  });

  it('reuses a lane once its previous event has ended', () => {
    const { events, laneCount } = packLanes([evt(0, 100), evt(10, 20), evt(30, 40)]);
    expect(laneCount).toBe(2);
    // Both short events fit in lane 1 behind each other; the long one holds lane 0.
    expect(events.map((e) => e.lane)).toEqual([0, 1, 1]);
  });

  it('honours minGap so back-to-back events do not share a lane', () => {
    const { laneCount } = packLanes([evt(0, 10), evt(11, 20)], 5);
    expect(laneCount).toBe(2);
  });

  it('sorts events chronologically regardless of input order', () => {
    const { events } = packLanes([evt(50, 60), evt(0, 10), evt(20, 30)]);
    expect(events.map((e) => e.start)).toEqual([0, 20, 50]);
  });

  it('handles an empty list', () => {
    const { events, laneCount } = packLanes([]);
    expect(events).toEqual([]);
    expect(laneCount).toBe(0);
  });
});
