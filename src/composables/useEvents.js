/**
 * useEvents - Game event timeline composable
 *
 * Reads `events` data from the current game plugin and derives everything the
 * timeline UI needs: parsed dates, live status, progress, gantt lane packing,
 * and the per-game "manually completed" set.
 *
 * Event data is hand-maintained in Google Sheets (tab: `Events`) and synced to
 * `src/games/{gameid}/data/events.json` by `scripts/sync-sheets.js`.
 * There is no public API for game schedules — official announcements are the source.
 *
 * Event schema (only `name` is required):
 *   {
 *     "id":          "9401260001",           // eventID from the sheet; falls back to name+startDate
 *     "name":        "Lynae Convene",        // English; localized via the Events_i18n tab
 *     "description": "...",                  // localized via Events_i18n `desc_ko`
 *     "category":    "banner",               // "banner" | "event"
 *     "cover":       "https://.../img.png",  // optional; empty -> color-only card
 *     "color":       "#BDAE92",              // accent color
 *     "sourceUrl":   "https://...",          // official announcement
 *     "startDate":   "2026-07-10 10:00",     // blank -> see the schedule types below
 *     "endDate":     "2026-08-19 11:59",     // blank -> see the schedule types below
 *     "recurrence":  16,                     // repeat period in DAYS; blank = one-off, 0/"always" = no cycle
 *     "utcOffset":   8                       // hours; defaults to DEFAULT_UTC_OFFSET
 *   }
 *
 * Schedule types derived from those fields (`event.type`):
 *   fixed      - both dates given. The normal case.
 *   recurring  - `recurrence` day count + a startDate anchor. The *current* cycle is
 *                what gets drawn; `endDate` (optional) is when the repeat stops.
 *   permanent  - runs until the game changes it: `recurrence` with no anchor, an
 *                explicit "always", or only one of the two dates.
 *   tba        - name only, no dates at all. Announced but not yet scheduled.
 */
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/store/game';
import { useLocale } from '@/composables/useLocale';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import logger from '@/utils/logger';

/** Most gacha games publish schedules in server time (UTC+8). */
export const DEFAULT_UTC_OFFSET = 8;

const MS_PER_DAY = 86400000;

/** Storage key (per game) for events the user ticked off by hand. */
const COMPLETED_KEY = 'timeline_completed';

/**
 * `recurrence` values that mean "runs forever, with no cycle to count down to".
 * Everything else in that cell is read as a plain number of days.
 */
const ALWAYS_VALUES = ['always', 'permanent', 'forever', '상시', '0'];

/** A blank cell is a blank cell, whatever shape the sheet exported it in. */
const isBlank = (value) =>
  value === null || value === undefined || String(value).trim() === '';

/** null sorts last rather than poisoning a subtraction with NaN. */
const sortKey = (value) => (value === null || value === undefined ? Number.MAX_SAFE_INTEGER : value);

/**
 * Parse "YYYY-MM-DD", "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss" at a fixed UTC offset.
 * Returns epoch ms, or null when unparseable.
 */
export function parseEventDate(value, utcOffset = DEFAULT_UTC_OFFSET) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;

  const str = String(value).trim();
  if (!str) return null;

  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(str);
  if (!m) {
    logger.debug(`[useEvents] Unparseable date: ${str}`);
    return null;
  }

  const [, y, mo, d, h = '0', mi = '0', s = '0'] = m;
  const offset = Number.isFinite(Number(utcOffset)) ? Number(utcOffset) : DEFAULT_UTC_OFFSET;

  return Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h) - offset,
    Number(mi),
    Number(s),
  );
}

/**
 * Normalize a `recurrence` cell into `{ days }`, or null when the event does not repeat.
 *
 * The period is **a number of days**, deliberately not a named period: a rotation
 * described as "every 2 weeks" often actually runs on 15 or 16 days, and the same
 * event can switch between 2- and 3-week cycles. A day count says exactly what the
 * schedule does; "biweekly" only says what someone called it.
 *
 * `days: 0` (or "always" / "상시") means it runs forever with no cycle to count down to.
 */
export function parseRecurrence(value) {
  if (isBlank(value)) return null;

  const raw = String(value).trim().toLowerCase();
  if (ALWAYS_VALUES.includes(raw)) return { days: 0 };
  if (['none', 'no', 'false', '없음'].includes(raw)) return null;

  // Tolerates a trailing unit ("16d", "16일") so a pasted cell still reads.
  const m = /^(\d+)\s*(?:d|day|days|일)?$/.exec(raw);
  if (m && Number(m[1]) > 0) return { days: Number(m[1]) };

  logger.debug(`[useEvents] Unreadable recurrence (expected a day count): ${value}`);
  return null;
}

/**
 * The cycle of a repeating event that contains `at`. Cycles end 1ms before the
 * next one starts so back-to-back occurrences never overlap on the chart.
 */
export function occurrenceWindow(anchor, periodMs, at) {
  const index = at >= anchor ? Math.floor((at - anchor) / periodMs) : 0;
  const start = anchor + index * periodMs;
  return { start, end: start + periodMs - 1 };
}

/**
 * Greedy lane packing: place each event in the first lane whose previous event
 * has already ended. `minGapMs` reserves room so adjacent bars keep their labels
 * readable instead of butting up against each other.
 */
export function packLanes(events, minGapMs = 0) {
  const laneEnds = [];
  const sorted = [...events].sort((a, b) => a.start - b.start || a.end - b.end);

  for (const event of sorted) {
    let lane = laneEnds.findIndex((end) => end + minGapMs <= event.start);
    if (lane === -1) {
      lane = laneEnds.length;
    }
    laneEnds[lane] = event.end;
    event.lane = lane;
  }

  return { events: sorted, laneCount: laneEnds.length };
}

/**
 * Manually-completed event ids, keyed by game. Module-level so the home widget
 * and the timeline page see the same set without a round trip through storage.
 */
const completedByGame = ref({});

export function useEvents(options = {}) {
  const { tickMs = 60000 } = options;
  const gameStore = useGameStore();
  // Event names live in the `Events_i18n` sheet tab, keyed by the same id.
  const { tEvent } = useLocale();

  // Ticks so "ongoing/ended" and progress bars stay live without a reload.
  const now = ref(Date.now());
  let timer = null;

  onMounted(() => {
    timer = setInterval(() => { now.value = Date.now(); }, tickMs);
  });
  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  // Load the completed set for whichever game is selected, once per game.
  watch(() => gameStore.currentGameId, (gameId) => {
    if (!gameId || completedByGame.value[gameId]) return;
    completedByGame.value = {
      ...completedByGame.value,
      [gameId]: loadFromStorage(COMPLETED_KEY, [], gameId) || [],
    };
  }, { immediate: true });

  const completedIds = computed(
    () => new Set(completedByGame.value[gameStore.currentGameId] || []),
  );

  const isCompleted = (id) => completedIds.value.has(id);

  const setCompleted = (id, value) => {
    const gameId = gameStore.currentGameId;
    if (!gameId || !id) return;

    const current = completedByGame.value[gameId] || [];
    if (value === current.includes(id)) return;

    const next = value ? [...current, id] : current.filter((x) => x !== id);
    completedByGame.value = { ...completedByGame.value, [gameId]: next };
    saveToStorage(COMPLETED_KEY, next, gameId);
  };

  const toggleComplete = (id) => setCompleted(id, !isCompleted(id));

  const clearCompleted = () => {
    const gameId = gameStore.currentGameId;
    if (!gameId) return;
    completedByGame.value = { ...completedByGame.value, [gameId]: [] };
    saveToStorage(COMPLETED_KEY, [], gameId);
  };

  /** Raw rows straight from the plugin, before normalization. */
  const rawEvents = computed(() => {
    const data = gameStore.currentGame?.getData?.('events');
    return Array.isArray(data) ? data : [];
  });

  /**
   * Normalized events. Blank dates are legal (see the schedule types in the file
   * header); a date that is *present but unparseable* is a broken row and is dropped.
   */
  const allEvents = computed(() => {
    const result = [];

    for (const row of rawEvents.value) {
      const utcOffset = row.utcOffset ?? DEFAULT_UTC_OFFSET;
      const anchor = parseEventDate(row.startDate, utcOffset);
      const finish = parseEventDate(row.endDate, utcOffset);

      if ((!isBlank(row.startDate) && anchor === null)
        || (!isBlank(row.endDate) && finish === null)) {
        logger.debug(`[useEvents] Skipping "${row.name}": unusable dates`);
        continue;
      }

      const recurrence = parseRecurrence(row.recurrence);

      let type;
      if (recurrence) type = recurrence.days > 0 && anchor !== null ? 'recurring' : 'permanent';
      else if (anchor !== null && finish !== null) type = 'fixed';
      else if (anchor !== null || finish !== null) type = 'permanent';
      else type = 'tba';

      const id = row.id || `${row.name}__${row.startDate ?? ''}`;

      result.push({
        ...row,
        id,
        // Falls back to the sheet's English text while a ko row is still blank.
        name: tEvent(id, row.name ?? ''),
        description: tEvent(`${id}.desc`, row.description ?? ''),
        category: row.category === 'banner' ? 'banner' : 'event',
        cover: row.cover || '',
        color: row.color || '#667eea',
        sourceUrl: row.sourceUrl || '',
        type,
        recurrence,
        anchor,
        finish: finish === null ? null : Math.max(finish, anchor ?? finish),
        lane: 0,
      });
    }

    return result.sort(
      (a, b) => sortKey(a.anchor) - sortKey(b.anchor) || sortKey(a.finish) - sortKey(b.finish),
    );
  });

  /**
   * Attach the window to draw plus live status/progress. Recomputes on every tick.
   * For a repeating event the window is the cycle happening right now, so the
   * gantt shows one bar and the countdown targets the next reset.
   */
  const decorate = (event) => {
    const current = now.value;
    let start = event.anchor;
    let end = event.finish;

    if (event.type === 'recurring') {
      const period = event.recurrence.days * MS_PER_DAY;
      if (current < start) {
        end = start + period - 1;
      } else if (end === null || current <= end) {
        const cycle = occurrenceWindow(start, period, current);
        start = cycle.start;
        // A cycle never runs past the date the repeat itself stops.
        end = end === null ? cycle.end : Math.min(end, cycle.end);
      }
    }

    let status;
    if (event.type === 'tba') status = 'tba';
    else if (start !== null && current < start) status = 'upcoming';
    else if (end !== null && current > end) status = 'ended';
    else status = 'ongoing';

    const scheduled = start !== null && end !== null;
    const span = scheduled ? Math.max(1, end - start) : 0;

    return {
      ...event,
      start,
      end,
      scheduled,
      status,
      completed: completedIds.value.has(event.id),
      progress: scheduled
        ? Math.min(100, Math.max(0, ((current - start) / span) * 100))
        : 0,
      // Ceil so an event ending in 2 hours reads "1 day left", never "0".
      daysLeft: end === null ? null : Math.ceil((end - current) / MS_PER_DAY),
      daysUntil: start === null ? null : Math.ceil((start - current) / MS_PER_DAY),
      durationDays: scheduled ? Math.max(1, Math.round(span / MS_PER_DAY)) : null,
    };
  };

  const decorated = computed(() => allEvents.value.map(decorate));

  /** Everything the user has not ticked off — what the timeline shows by default. */
  const active = computed(() => decorated.value.filter((e) => !e.completed));
  const completed = computed(() => decorated.value.filter((e) => e.completed));

  const ongoing = computed(() => active.value.filter((e) => e.status === 'ongoing'));
  const upcoming = computed(() => active.value.filter((e) => e.status === 'upcoming'));
  const ended = computed(() => active.value.filter((e) => e.status === 'ended'));
  const tba = computed(() => active.value.filter((e) => e.status === 'tba'));

  /** Ongoing sorted by soonest deadline — what the home widget should surface. */
  const endingSoon = computed(
    () => [...ongoing.value].sort((a, b) => sortKey(a.end) - sortKey(b.end)),
  );

  const hasEvents = computed(() => decorated.value.length > 0);

  return {
    now,
    rawEvents,
    allEvents,
    events: decorated,
    active,
    ongoing,
    upcoming,
    ended,
    tba,
    completed,
    endingSoon,
    hasEvents,
    completedIds,
    isCompleted,
    setCompleted,
    toggleComplete,
    clearCompleted,
    packLanes,
    parseEventDate,
    parseRecurrence,
  };
}

export default useEvents;
