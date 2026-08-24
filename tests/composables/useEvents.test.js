import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { parseEventDate, packLanes, DEFAULT_UTC_OFFSET } from '@/composables/useEvents';
import useEvents from '@/composables/useEvents';

// Rows shaped like the synced `events.json`: `id` is the sheet's eventID formula.
vi.mock('@/store/game', () => ({
  useGameStore: () => ({
    currentGame: {
      getData: (type) => (type === 'events' ? [
        { id: '9401260001', name: 'Daphne Convene', description: 'Featured 5-star rate-up.',
          category: 'banner',
          startDate: '2026-08-12 04:00', endDate: '2026-09-02 03:59', utcOffset: 8 },
        { id: '9402260002', name: 'Twilight Tread Exchange',
          startDate: '2026-08-12 04:00', endDate: '2026-08-26 03:59', utcOffset: 8 },
        { id: '9402260003', name: 'Broken date row',
          startDate: '⚠', endDate: '⚠', utcOffset: 8 },
      ] : null),
    },
  }),
}));

/** useEvents needs a setup context (it registers a tick interval). */
function runUseEvents() {
  let api = null;
  mount({ setup() { api = useEvents(); return () => null; } });
  return api;
}

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


describe('useEvents name localization', () => {
  it('keys events by the sheet eventID', () => {
    const { events } = runUseEvents();
    // Same start date, so the sort tie-breaks on the earlier end date.
    expect(events.value.map((e) => e.id)).toEqual(['9402260002', '9401260001']);
  });

  // Names go through `tEvent(id, name)`, so a missing Events_i18n row must not blank them out.
  it('falls back to the sheet English name when no translation is loaded', () => {
    const { events } = runUseEvents();
    expect(events.value.map((e) => e.name))
      .toEqual(['Twilight Tread Exchange', 'Daphne Convene']);
  });

  // The blurb resolves through `<id>.desc`, fed by the sheet's desc_ko column.
  it('falls back to the sheet English description when no translation is loaded', () => {
    const { events } = runUseEvents();
    const daphne = events.value.find((e) => e.id === '9401260001');
    expect(daphne.description).toBe('Featured 5-star rate-up.');
  });

  it('drops rows whose dates the sheet could not compute', () => {
    const { events } = runUseEvents();
    expect(events.value.some((e) => e.name === 'Broken date row')).toBe(false);
  });
});
