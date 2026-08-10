<template>
  <div class="event-gantt">
    <div class="gantt-toolbar">
      <div class="zoom-controls">
        <button
          type="button"
          class="zoom-btn"
          :disabled="dayWidth <= MIN_DAY_WIDTH"
          :aria-label="tUI('timeline.zoomOut')"
          @click="zoom(-1)"
        >−</button>
        <button
          type="button"
          class="zoom-btn"
          :disabled="dayWidth >= MAX_DAY_WIDTH"
          :aria-label="tUI('timeline.zoomIn')"
          @click="zoom(1)"
        >+</button>
      </div>
      <button type="button" class="today-btn" @click="scrollToToday">
        {{ tUI('timeline.today') }}
      </button>
    </div>

    <div ref="scroller" class="gantt-scroll">
      <div class="gantt-canvas" :style="{ width: `${canvasWidth}px` }">
        <!-- Month header -->
        <div class="axis-months">
          <div
            v-for="month in months"
            :key="month.key"
            class="axis-month"
            :style="{ left: `${month.left}px`, width: `${month.width}px` }"
          >
            {{ month.label }}
          </div>
        </div>

        <!-- Day header -->
        <div class="axis-days">
          <div
            v-for="tick in dayTicks"
            :key="tick.key"
            class="axis-day"
            :class="{ 'is-weekend': tick.isWeekend }"
            :style="{ left: `${tick.left}px`, width: `${dayWidth}px` }"
          >
            <span v-if="tick.showLabel">{{ tick.label }}</span>
          </div>
        </div>

        <!-- Body: gridlines + today marker + tracks -->
        <div class="gantt-body" :style="{ height: `${bodyHeight}px` }">
          <div
            v-for="tick in dayTicks"
            :key="`grid-${tick.key}`"
            class="gridline"
            :class="{ 'is-weekend': tick.isWeekend, 'is-month-start': tick.isMonthStart }"
            :style="{ left: `${tick.left}px`, width: `${dayWidth}px` }"
          />

          <div
            v-if="todayLeft !== null"
            class="today-line"
            :style="{ left: `${todayLeft}px` }"
          >
            <span class="today-dot" />
          </div>

          <template v-for="track in tracks" :key="track.key">
            <div class="track-label" :style="{ top: `${track.top}px` }">
              {{ track.label }}
            </div>

            <a
              v-for="event in track.events"
              :key="event.id"
              class="gantt-bar"
              :class="[`is-${event.status}`, { 'is-narrow': barWidth(event) < 90 }]"
              :href="event.sourceUrl || null"
              :target="event.sourceUrl ? '_blank' : null"
              :rel="event.sourceUrl ? 'noopener noreferrer' : null"
              :style="{
                left: `${barLeft(event)}px`,
                width: `${barWidth(event)}px`,
                top: `${track.top + TRACK_HEADER + event.lane * (BAR_HEIGHT + BAR_GAP)}px`,
                '--event-color': event.color,
              }"
              :title="`${event.name}\n${formatRange(event)}`"
            >
              <EventCover
                class="bar-cover"
                :src="event.cover"
                :alt="event.name"
                :color="event.color"
              />
              <span class="bar-name">{{ event.name }}</span>
            </a>
          </template>
        </div>
      </div>
    </div>

    <p v-if="!tracks.length" class="gantt-empty">{{ tUI('timeline.empty') }}</p>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import EventCover from './EventCover.vue';
import { packLanes } from '@/composables/useEvents';
import { useLocale } from '@/composables/useLocale';

const props = defineProps({
  events: { type: Array, default: () => [] },
  now: { type: Number, default: () => Date.now() },
});

const { tUI } = useLocale();

const MS_PER_DAY = 86400000;
const BAR_HEIGHT = 34;
const BAR_GAP = 6;
const TRACK_HEADER = 24;
const TRACK_GAP = 16;
const MIN_DAY_WIDTH = 8;
const MAX_DAY_WIDTH = 60;

const dayWidth = ref(22);
const scroller = ref(null);

const zoom = (direction) => {
  const next = dayWidth.value + direction * 6;
  dayWidth.value = Math.min(MAX_DAY_WIDTH, Math.max(MIN_DAY_WIDTH, next));
};

/** Snap a timestamp to the start of its local day. */
const startOfDay = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Visible window: whole days spanning every event, padded by a day on each side. */
const range = computed(() => {
  if (!props.events.length) {
    const today = startOfDay(props.now);
    return { start: today, end: today + MS_PER_DAY };
  }

  const starts = props.events.map((e) => e.start);
  const ends = props.events.map((e) => e.end);
  const start = startOfDay(Math.min(...starts)) - MS_PER_DAY;
  const end = startOfDay(Math.max(...ends)) + 2 * MS_PER_DAY;

  return { start, end };
});

const totalDays = computed(() =>
  Math.max(1, Math.round((range.value.end - range.value.start) / MS_PER_DAY)),
);

const canvasWidth = computed(() => totalDays.value * dayWidth.value);

const toX = (ms) => ((ms - range.value.start) / MS_PER_DAY) * dayWidth.value;

const barLeft = (event) => toX(event.start);
// Clamp so a same-day event still renders a visible sliver.
const barWidth = (event) => Math.max(dayWidth.value, toX(event.end) - toX(event.start));

/** One tick per day. Labels thin out as you zoom out so they never overlap. */
const dayTicks = computed(() => {
  const ticks = [];
  const labelEvery = dayWidth.value >= 34 ? 1 : dayWidth.value >= 18 ? 2 : 5;

  for (let i = 0; i < totalDays.value; i++) {
    const ms = range.value.start + i * MS_PER_DAY;
    const date = new Date(ms);
    const dayOfMonth = date.getDate();
    const weekday = date.getDay();

    ticks.push({
      key: ms,
      left: i * dayWidth.value,
      label: dayOfMonth,
      isWeekend: weekday === 0 || weekday === 6,
      isMonthStart: dayOfMonth === 1,
      showLabel: dayOfMonth === 1 || dayOfMonth % labelEvery === 0,
    });
  }

  return ticks;
});

const monthFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' });

const months = computed(() => {
  const result = [];

  for (const tick of dayTicks.value) {
    const date = new Date(tick.key);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = result[result.length - 1];

    if (last && last.key === key) {
      last.width += dayWidth.value;
    } else {
      result.push({
        key,
        label: monthFormat.format(date),
        left: tick.left,
        width: dayWidth.value,
      });
    }
  }

  return result;
});

const todayLeft = computed(() => {
  const x = toX(props.now);
  return x < 0 || x > canvasWidth.value ? null : x;
});

/**
 * Split into banner / event tracks, pack lanes within each, and stack them
 * vertically. `minGap` reserves ~3 days of pixels so short back-to-back events
 * don't share a lane with no visual break.
 */
const tracks = computed(() => {
  const groups = [
    { key: 'banner', label: tUI('timeline.banners'), items: [] },
    { key: 'event', label: tUI('timeline.events'), items: [] },
  ];

  for (const event of props.events) {
    const group = groups.find((g) => g.key === event.category) ?? groups[1];
    group.items.push({ ...event });
  }

  const minGap = (12 / Math.max(1, dayWidth.value)) * MS_PER_DAY;
  let top = 0;
  const result = [];

  for (const group of groups) {
    if (!group.items.length) continue;

    const { events, laneCount } = packLanes(group.items, minGap);
    result.push({ key: group.key, label: group.label, events, top });
    top += TRACK_HEADER + laneCount * (BAR_HEIGHT + BAR_GAP) + TRACK_GAP;
  }

  return result;
});

const bodyHeight = computed(() => {
  const last = tracks.value[tracks.value.length - 1];
  if (!last) return 80;
  const laneCount = Math.max(...last.events.map((e) => e.lane)) + 1;
  return last.top + TRACK_HEADER + laneCount * (BAR_HEIGHT + BAR_GAP) + TRACK_GAP;
});

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatRange = (event) =>
  `${dateFormat.format(new Date(event.start))} — ${dateFormat.format(new Date(event.end))}`;

const scrollToToday = () => {
  const el = scroller.value;
  if (!el) return;
  const x = toX(props.now);
  // Park "today" a third of the way in so upcoming events stay visible.
  el.scrollTo({ left: Math.max(0, x - el.clientWidth / 3), behavior: 'smooth' });
};

onMounted(async () => {
  await nextTick();
  scrollToToday();
});

// Re-center after a game switch repopulates the timeline.
watch(() => props.events.length, async () => {
  await nextTick();
  scrollToToday();
});
</script>

<style scoped>
.event-gantt {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gantt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.zoom-controls {
  display: flex;
  gap: 0.25rem;
}

.zoom-btn,
.today-btn {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text, #213547);
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.zoom-btn:hover:not(:disabled),
.today-btn:hover {
  border-color: var(--border-focus, #667eea);
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.gantt-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 10px;
  background: var(--bg-surface, #fff);
}

.gantt-canvas {
  position: relative;
  min-width: 100%;
}

.axis-months {
  position: relative;
  height: 22px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.axis-month {
  position: absolute;
  top: 0;
  height: 22px;
  display: flex;
  align-items: center;
  padding-left: 0.4rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted, #666);
  border-left: 1px solid var(--border, #e0e0e0);
  white-space: nowrap;
  overflow: hidden;
}

.axis-days {
  position: relative;
  height: 18px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.axis-day {
  position: absolute;
  top: 0;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  color: var(--text-muted, #888);
  font-variant-numeric: tabular-nums;
}

.axis-day.is-weekend {
  color: color-mix(in srgb, #ef4444 65%, var(--text-muted, #888));
}

.gantt-body {
  position: relative;
}

.gridline {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px solid color-mix(in srgb, var(--border, #e0e0e0) 45%, transparent);
}

.gridline.is-weekend {
  background: color-mix(in srgb, var(--border, #e0e0e0) 22%, transparent);
}

.gridline.is-month-start {
  border-left-color: var(--border, #e0e0e0);
}

.today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ef4444;
  z-index: 3;
  pointer-events: none;
}

.today-dot {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.track-label {
  position: absolute;
  left: 0;
  z-index: 2;
  padding: 0.15rem 0.5rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted, #888);
  background: var(--bg-surface, #fff);
  border-radius: 0 6px 6px 0;
  pointer-events: none;
}

.gantt-bar {
  position: absolute;
  z-index: 2;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.4rem;
  border-radius: 6px;
  text-decoration: none;
  overflow: hidden;
  white-space: nowrap;
  background: color-mix(in srgb, var(--event-color) 26%, var(--bg-surface, #fff));
  border: 1px solid var(--event-color);
  border-left: 3px solid var(--event-color);
  transition: filter 0.15s;
}

.gantt-bar:hover {
  filter: brightness(1.06);
  z-index: 4;
}

.gantt-bar.is-ended {
  opacity: 0.45;
}

.gantt-bar.is-upcoming {
  border-style: dashed;
}

.bar-cover {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.gantt-bar.is-narrow .bar-cover {
  display: none;
}

.bar-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text, #213547);
  overflow: hidden;
  text-overflow: ellipsis;
}

.gantt-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-muted, #888);
  font-size: 0.9rem;
}
</style>
