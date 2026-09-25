import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { parseRecurrence, occurrenceWindow } from '@/composables/useEvents';
import useEvents from '@/composables/useEvents';

const DAY = 86400000;

/**
 * Rows shaped like the synced `events.json`, covering every schedule type the
 * sheet can express now that startDate/endDate are optional.
 */
const rows = [
  { id: 'fixed-1', name: 'Fixed Event',
    startDate: '2026-08-12 04:00', endDate: '2026-09-02 03:59', utcOffset: 8 },
  { id: 'recurring-1', name: 'Rotating Raid',
    startDate: '2026-08-12 04:00', recurrence: 14, utcOffset: 8 },
  { id: 'permanent-1', name: 'Standard Banner', recurrence: 'always' },
  { id: 'permanent-2', name: 'Shop Reset', recurrence: '16' },
  { id: 'tba-1', name: 'Announced Only', description: 'Coming soon.' },
  { id: 'broken-1', name: 'Broken date row', startDate: '⚠', endDate: '⚠' },
];

vi.mock('@/store/game', () => ({
  useGameStore: () => ({
    currentGameId: 'testgame',
    currentGame: { getData: (type) => (type === 'events' ? rows : null) },
  }),
}));

/** useEvents needs a setup context (it registers a tick interval and a watcher). */
function runUseEvents() {
  let api = null;
  mount({ setup() { api = useEvents(); return () => null; } });
  return api;
}

const byId = (events, id) => events.value.find((e) => e.id === id);

describe('parseRecurrence', () => {
  it('returns null for a blank or explicitly-off cell', () => {
    expect(parseRecurrence('')).toBeNull();
    expect(parseRecurrence(null)).toBeNull();
    expect(parseRecurrence('none')).toBeNull();
    expect(parseRecurrence('없음')).toBeNull();
  });

  it('reads the period as a day count', () => {
    expect(parseRecurrence(14)).toEqual({ days: 14 });
    expect(parseRecurrence('21')).toEqual({ days: 21 });
  });

  // The whole point of a day count: "2 weeks" is not always 14 days.
  it('keeps an off-by-a-couple-days period exactly as written', () => {
    expect(parseRecurrence('15')).toEqual({ days: 15 });
    expect(parseRecurrence('16')).toEqual({ days: 16 });
  });

  it('tolerates a trailing unit', () => {
    expect(parseRecurrence('16d')).toEqual({ days: 16 });
    expect(parseRecurrence('16일')).toEqual({ days: 16 });
  });

  it('treats "always" and 0 as a run with no cycle', () => {
    expect(parseRecurrence('always')).toEqual({ days: 0 });
    expect(parseRecurrence('상시')).toEqual({ days: 0 });
    expect(parseRecurrence('0')).toEqual({ days: 0 });
  });

  it('returns null for a named period it no longer accepts', () => {
    expect(parseRecurrence('biweekly')).toBeNull();
    expect(parseRecurrence('격주')).toBeNull();
    expect(parseRecurrence('every so often')).toBeNull();
  });
});

describe('occurrenceWindow', () => {
  const anchor = 0;
  const period = 14 * DAY;

  it('returns the cycle containing the given instant', () => {
    const { start, end } = occurrenceWindow(anchor, period, 20 * DAY);
    expect(start).toBe(14 * DAY);
    expect(end).toBe(28 * DAY - 1);
  });

  it('clamps to the first cycle before the anchor', () => {
    expect(occurrenceWindow(anchor, period, -5 * DAY).start).toBe(anchor);
  });

  it('never lets one cycle overlap the next', () => {
    const first = occurrenceWindow(anchor, period, 0);
    const second = occurrenceWindow(anchor, period, period);
    expect(first.end).toBeLessThan(second.start);
  });
});

describe('useEvents schedule types', () => {
  beforeEach(() => {
    // Inside the second cycle of the biweekly event (anchor + 20 days).
    vi.setSystemTime(new Date(Date.UTC(2026, 7, 31, 12, 0, 0)));
  });

  it('keeps a row that has a name but no dates, as TBA', () => {
    const { events } = runUseEvents();
    const tba = byId(events, 'tba-1');
    expect(tba.type).toBe('tba');
    expect(tba.status).toBe('tba');
    expect(tba.start).toBeNull();
    expect(tba.end).toBeNull();
    expect(tba.scheduled).toBe(false);
  });

  it('still drops a row whose dates are filled in but unusable', () => {
    const { events } = runUseEvents();
    expect(byId(events, 'broken-1')).toBeUndefined();
  });

  it('draws a repeating event as the cycle happening right now', () => {
    const { events } = runUseEvents();
    const raid = byId(events, 'recurring-1');

    expect(raid.type).toBe('recurring');
    expect(raid.status).toBe('ongoing');
    expect(raid.scheduled).toBe(true);
    // Anchor 2026-08-12 04:00 (+8) + 14 days = the cycle covering 2026-08-31.
    expect(raid.start).toBe(Date.UTC(2026, 7, 25, 20, 0, 0));
    expect(raid.durationDays).toBe(14);
  });

  it('treats a repeat with no anchor as running until the game changes it', () => {
    const { events } = runUseEvents();
    for (const id of ['permanent-1', 'permanent-2']) {
      const event = byId(events, id);
      expect(event.type).toBe('permanent');
      expect(event.status).toBe('ongoing');
      expect(event.end).toBeNull();
      expect(event.daysLeft).toBeNull();
      expect(event.scheduled).toBe(false);
    }
  });

  it('keeps the recurrence period on the event for the UI to label', () => {
    const { events } = runUseEvents();
    expect(byId(events, 'permanent-2').recurrence).toEqual({ days: 16 });
    expect(byId(events, 'fixed-1').recurrence).toBeNull();
  });

  it('leaves a plain two-date event alone', () => {
    const { events } = runUseEvents();
    const fixed = byId(events, 'fixed-1');
    expect(fixed.type).toBe('fixed');
    expect(fixed.scheduled).toBe(true);
    expect(fixed.status).toBe('ongoing');
  });
});

describe('useEvents manual completion', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(Date.UTC(2026, 7, 31, 12, 0, 0)));
    const { clearCompleted } = runUseEvents();
    clearCompleted();
  });

  it('starts with nothing completed', () => {
    const { completed, active, events } = runUseEvents();
    expect(completed.value).toHaveLength(0);
    expect(active.value).toHaveLength(events.value.length);
  });

  it('drops a completed event from the active list but keeps it in events', () => {
    const { toggleComplete, active, events, completed } = runUseEvents();
    toggleComplete('fixed-1');

    expect(active.value.some((e) => e.id === 'fixed-1')).toBe(false);
    expect(completed.value.map((e) => e.id)).toEqual(['fixed-1']);
    expect(byId(events, 'fixed-1').completed).toBe(true);
  });

  it('hides a completed event from the home widget lists', () => {
    const { toggleComplete, ongoing, endingSoon } = runUseEvents();
    toggleComplete('fixed-1');

    expect(ongoing.value.some((e) => e.id === 'fixed-1')).toBe(false);
    expect(endingSoon.value.some((e) => e.id === 'fixed-1')).toBe(false);
  });

  it('toggles back off', () => {
    const { toggleComplete, isCompleted } = runUseEvents();
    toggleComplete('tba-1');
    expect(isCompleted('tba-1')).toBe(true);
    toggleComplete('tba-1');
    expect(isCompleted('tba-1')).toBe(false);
  });

  it('shares the completed set across composable instances', () => {
    const first = runUseEvents();
    const second = runUseEvents();
    first.toggleComplete('recurring-1');
    expect(second.isCompleted('recurring-1')).toBe(true);
  });

  it('orders open-ended events after ones with a deadline', () => {
    const { endingSoon } = runUseEvents();
    const ids = endingSoon.value.map((e) => e.id);
    expect(ids.indexOf('permanent-1')).toBeGreaterThan(ids.indexOf('fixed-1'));
  });
});
