/**
 * useEvents - Game event timeline composable
 *
 * Reads `events` data from the current game plugin and derives everything the
 * timeline UI needs: parsed dates, live status, progress, and gantt lane packing.
 *
 * Event data is hand-maintained in Google Sheets (tab: `Events`) and synced to
 * `src/games/{gameid}/data/events.json` by `scripts/sync-sheets.js`.
 * There is no public API for game schedules — official announcements are the source.
 *
 * Event schema (all fields optional except name/startDate/endDate):
 *   {
 *     "id":          "wuwa-3-5-lynae",       // stable key; falls back to name+startDate
 *     "name":        "Lynae Convene",
 *     "description": "...",
 *     "category":    "banner",                // "banner" | "event"
 *     "cover":       "https://.../img.png",   // optional; empty -> color-only card
 *     "color":       "#BDAE92",               // accent color
 *     "sourceUrl":   "https://...",           // official announcement
 *     "startDate":   "2026-07-10 10:00",
 *     "endDate":     "2026-08-19 11:59",
 *     "utcOffset":   8                        // hours; defaults to DEFAULT_UTC_OFFSET
 *   }
 */
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

/** Most gacha games publish schedules in server time (UTC+8). */
export const DEFAULT_UTC_OFFSET = 8;

const MS_PER_DAY = 86400000;

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

export function useEvents(options = {}) {
  const { tickMs = 60000 } = options;
  const gameStore = useGameStore();

  // Ticks so "ongoing/ended" and progress bars stay live without a reload.
  const now = ref(Date.now());
  let timer = null;

  onMounted(() => {
    timer = setInterval(() => { now.value = Date.now(); }, tickMs);
  });
  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  /** Raw rows straight from the plugin, before normalization. */
  const rawEvents = computed(() => {
    const data = gameStore.currentGame?.getData?.('events');
    return Array.isArray(data) ? data : [];
  });

  /** Normalized + date-parsed events. Rows with unusable dates are dropped. */
  const allEvents = computed(() => {
    const result = [];

    for (const row of rawEvents.value) {
      const utcOffset = row.utcOffset ?? DEFAULT_UTC_OFFSET;
      const start = parseEventDate(row.startDate, utcOffset);
      const end = parseEventDate(row.endDate, utcOffset);

      if (start === null || end === null) {
        logger.debug(`[useEvents] Skipping "${row.name}": missing or invalid dates`);
        continue;
      }

      result.push({
        ...row,
        id: row.id || `${row.name}__${row.startDate}`,
        name: row.name ?? '',
        description: row.description ?? '',
        category: row.category === 'banner' ? 'banner' : 'event',
        cover: row.cover || '',
        color: row.color || '#667eea',
        sourceUrl: row.sourceUrl || '',
        start,
        end: Math.max(start, end),
        lane: 0,
      });
    }

    return result.sort((a, b) => a.start - b.start || a.end - b.end);
  });

  /** Attach live status/progress. Recomputes on every tick. */
  const decorate = (event) => {
    const current = now.value;
    const span = Math.max(1, event.end - event.start);

    let status = 'ongoing';
    if (current < event.start) status = 'upcoming';
    else if (current > event.end) status = 'ended';

    return {
      ...event,
      status,
      progress: Math.min(100, Math.max(0, ((current - event.start) / span) * 100)),
      // Ceil so a event ending in 2 hours reads "1 day left", never "0".
      daysLeft: Math.ceil((event.end - current) / MS_PER_DAY),
      daysUntil: Math.ceil((event.start - current) / MS_PER_DAY),
      durationDays: Math.max(1, Math.round(span / MS_PER_DAY)),
    };
  };

  const decorated = computed(() => allEvents.value.map(decorate));

  const ongoing = computed(() => decorated.value.filter((e) => e.status === 'ongoing'));
  const upcoming = computed(() => decorated.value.filter((e) => e.status === 'upcoming'));
  const ended = computed(() => decorated.value.filter((e) => e.status === 'ended'));

  /** Ongoing sorted by soonest deadline — what the home widget should surface. */
  const endingSoon = computed(() => [...ongoing.value].sort((a, b) => a.end - b.end));

  const hasEvents = computed(() => decorated.value.length > 0);

  return {
    now,
    rawEvents,
    allEvents,
    events: decorated,
    ongoing,
    upcoming,
    ended,
    endingSoon,
    hasEvents,
    packLanes,
    parseEventDate,
  };
}

export default useEvents;
