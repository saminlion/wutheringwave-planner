<template>
  <div class="event-list">
    <section v-for="group in groups" :key="group.key" class="event-group">
      <h3 class="group-title">
        {{ group.label }}
        <span class="group-count">{{ group.items.length }}</span>
      </h3>

      <div
        v-for="event in group.items"
        :key="event.id"
        class="event-row"
        :class="{ 'is-completed': event.completed }"
      >
        <component
          :is="event.sourceUrl ? 'a' : 'div'"
          class="event-card"
          :class="`is-${event.status}`"
          :href="event.sourceUrl || null"
          :target="event.sourceUrl ? '_blank' : null"
          :rel="event.sourceUrl ? 'noopener noreferrer' : null"
          :style="{ '--event-color': event.color }"
        >
          <EventCover
            class="card-cover"
            :src="event.cover"
            :alt="event.name"
            :color="event.color"
          />

          <div class="card-body">
            <div class="card-head">
              <span class="card-name">{{ event.name }}</span>
              <span class="card-badge" :class="`badge-${event.status}`">
                {{ badgeText(event) }}
              </span>
            </div>

            <p v-if="event.description && !compact" class="card-desc">
              {{ event.description }}
            </p>

            <div v-if="event.status === 'ongoing' && event.scheduled" class="card-progress">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${event.progress}%` }" />
              </div>
            </div>

            <div class="card-dates">
              {{ formatRange(event) }}
            </div>
          </div>
        </component>

        <!-- Outside the anchor: a button nested in a link is invalid and unclickable. -->
        <button
          v-if="!compact"
          type="button"
          class="card-check"
          :class="{ 'is-on': event.completed }"
          :title="event.completed ? tUI('timeline.markIncomplete') : tUI('timeline.markComplete')"
          :aria-pressed="event.completed"
          @click="emit('toggleComplete', event)"
        >✓</button>
      </div>
    </section>

    <p v-if="!groups.length" class="event-empty">{{ tUI('timeline.empty') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EventCover from './EventCover.vue';
import { useLocale } from '@/composables/useLocale';

const props = defineProps({
  events: { type: Array, default: () => [] },
  /** Hide descriptions, the complete button, and ended events — used by the home widget. */
  compact: { type: Boolean, default: false },
  /** Cap the number of cards rendered per group (0 = no limit). */
  limit: { type: Number, default: 0 },
  showEnded: { type: Boolean, default: true },
});

const emit = defineEmits(['toggleComplete']);

const { tUI, locale } = useLocale();

const applyLimit = (items) => (props.limit > 0 ? items.slice(0, props.limit) : items);

const groups = computed(() => {
  const byStatus = { ongoing: [], upcoming: [], tba: [], ended: [] };
  for (const event of props.events) {
    byStatus[event.status]?.push(event);
  }

  // Ongoing: soonest deadline first — open-ended ones have no deadline, so last.
  const deadline = (e) => (e.end === null ? Number.MAX_SAFE_INTEGER : e.end);
  byStatus.ongoing.sort((a, b) => deadline(a) - deadline(b));
  byStatus.upcoming.sort((a, b) => a.start - b.start);
  byStatus.ended.sort((a, b) => b.end - a.end);

  const showEnded = props.showEnded && !props.compact;

  return [
    { key: 'ongoing', label: tUI('timeline.ongoing'), items: applyLimit(byStatus.ongoing) },
    { key: 'upcoming', label: tUI('timeline.upcoming'), items: applyLimit(byStatus.upcoming) },
    { key: 'tba', label: tUI('timeline.tba'), items: applyLimit(byStatus.tba) },
    ...(showEnded
      ? [{ key: 'ended', label: tUI('timeline.ended'), items: applyLimit(byStatus.ended) }]
      : []),
  ].filter((group) => group.items.length > 0);
});

/**
 * "Every 16 days" / "Always on" for repeating events; '' for one-off ones.
 * Always the raw day count — a cycle called "2 weeks" may really be 15 or 16 days,
 * so naming the period would be less accurate, not friendlier.
 */
const recurrenceLabel = (event) => {
  if (!event.recurrence) return '';
  return event.recurrence.days === 0
    ? tUI('timeline.always')
    : tUI('timeline.everyDays').replace('{n}', event.recurrence.days);
};

const badgeText = (event) => {
  if (event.status === 'tba') return tUI('timeline.tba');

  if (event.status === 'ongoing') {
    // An open-ended run has no countdown — say how it repeats instead.
    if (event.daysLeft === null) return recurrenceLabel(event) || tUI('timeline.always');
    return event.daysLeft <= 0 ? tUI('timeline.endsToday') : `D-${event.daysLeft}`;
  }
  if (event.status === 'upcoming') {
    return event.daysUntil <= 0
      ? tUI('timeline.startsToday')
      : tUI('timeline.inDays').replace('{n}', event.daysUntil);
  }
  return tUI('timeline.ended');
};

// Follows the app's language picker rather than the browser locale, so switching
// to ko does not leave English dates next to Korean event names.
const dateFormat = computed(() => new Intl.DateTimeFormat(locale.value, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}));

const formatRange = (event) => {
  const fmt = (ms) => dateFormat.value.format(new Date(ms));
  const repeat = recurrenceLabel(event);

  let range;
  if (event.start === null && event.end === null) range = tUI('timeline.dateTba');
  else if (event.end === null) range = `${fmt(event.start)} — ${tUI('timeline.noEnd')}`;
  else if (event.start === null) range = `— ${fmt(event.end)}`;
  else range = `${fmt(event.start)} — ${fmt(event.end)}`;

  // The badge already says "Every 2 weeks" when there is no countdown to show.
  return repeat && event.daysLeft !== null ? `${range} · ${repeat}` : range;
};
</script>

<style scoped>
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.event-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted, #888);
  margin: 0;
}

.group-count {
  font-size: 0.7rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: var(--border, #e0e0e0);
  color: var(--text-muted, #666);
}

.event-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.event-row.is-completed .event-card {
  opacity: 0.5;
}

.event-card {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 0.75rem;
  padding: 0.7rem;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-left: 3px solid var(--event-color);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, transform 0.15s;
}

a.event-card:hover {
  border-color: var(--border-focus, #667eea);
  transform: translateX(2px);
}

.event-card.is-ended {
  opacity: 0.55;
}

.card-check {
  flex-shrink: 0;
  width: 34px;
  align-self: stretch;
  font-size: 0.95rem;
  line-height: 1;
  color: var(--text-muted, #aaa);
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 10px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.card-check:hover {
  color: var(--color-success, #27ae60);
  border-color: var(--color-success, #27ae60);
}

.card-check.is-on {
  color: #fff;
  background: var(--color-success, #27ae60);
  border-color: var(--color-success, #27ae60);
}

.card-cover {
  width: 56px;
  height: 56px;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text, #213547);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-badge {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
}

.badge-ongoing {
  background: color-mix(in srgb, #22c55e 18%, transparent);
  color: #15803d;
}

.badge-upcoming {
  background: color-mix(in srgb, #3b82f6 18%, transparent);
  color: #1d4ed8;
}

.badge-tba {
  background: color-mix(in srgb, #a855f7 18%, transparent);
  color: #7e22ce;
}

.badge-ended {
  background: var(--border, #e0e0e0);
  color: var(--text-muted, #666);
}

.card-desc {
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--text-muted, #666);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-track {
  height: 4px;
  border-radius: 999px;
  background: var(--border, #e0e0e0);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--event-color);
  transition: width 0.3s;
}

.card-dates {
  font-size: 0.72rem;
  color: var(--text-muted, #888);
  font-variant-numeric: tabular-nums;
}

.event-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-muted, #888);
  font-size: 0.9rem;
}
</style>
