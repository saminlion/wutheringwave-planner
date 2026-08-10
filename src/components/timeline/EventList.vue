<template>
  <div class="event-list">
    <section v-for="group in groups" :key="group.key" class="event-group">
      <h3 class="group-title">
        {{ group.label }}
        <span class="group-count">{{ group.items.length }}</span>
      </h3>

      <component
        :is="event.sourceUrl ? 'a' : 'div'"
        v-for="event in group.items"
        :key="event.id"
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

          <div v-if="event.status === 'ongoing'" class="card-progress">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${event.progress}%` }" />
            </div>
          </div>

          <div class="card-dates">
            {{ formatRange(event) }}
          </div>
        </div>
      </component>
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
  /** Hide descriptions and ended events — used by the home widget. */
  compact: { type: Boolean, default: false },
  /** Cap the number of cards rendered per group (0 = no limit). */
  limit: { type: Number, default: 0 },
  showEnded: { type: Boolean, default: true },
});

const { tUI } = useLocale();

const applyLimit = (items) => (props.limit > 0 ? items.slice(0, props.limit) : items);

const groups = computed(() => {
  const byStatus = { ongoing: [], upcoming: [], ended: [] };
  for (const event of props.events) {
    byStatus[event.status]?.push(event);
  }

  // Ongoing: soonest deadline first. Upcoming: soonest start first.
  byStatus.ongoing.sort((a, b) => a.end - b.end);
  byStatus.upcoming.sort((a, b) => a.start - b.start);
  byStatus.ended.sort((a, b) => b.end - a.end);

  const showEnded = props.showEnded && !props.compact;

  return [
    { key: 'ongoing', label: tUI('timeline.ongoing'), items: applyLimit(byStatus.ongoing) },
    { key: 'upcoming', label: tUI('timeline.upcoming'), items: applyLimit(byStatus.upcoming) },
    ...(showEnded
      ? [{ key: 'ended', label: tUI('timeline.ended'), items: applyLimit(byStatus.ended) }]
      : []),
  ].filter((group) => group.items.length > 0);
});

const badgeText = (event) => {
  if (event.status === 'ongoing') {
    return event.daysLeft <= 0
      ? tUI('timeline.endsToday')
      : `D-${event.daysLeft}`;
  }
  if (event.status === 'upcoming') {
    return event.daysUntil <= 0
      ? tUI('timeline.startsToday')
      : tUI('timeline.inDays').replace('{n}', event.daysUntil);
  }
  return tUI('timeline.ended');
};

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatRange = (event) =>
  `${dateFormat.format(new Date(event.start))} — ${dateFormat.format(new Date(event.end))}`;
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

.event-card {
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
