<template>
  <div class="timeline-view">
    <header class="timeline-header">
      <h2 class="timeline-title">{{ tUI('timeline.title') }}</h2>

      <div class="timeline-tabs" role="tablist">
        <button
          v-for="tab in TABS"
          :key="tab"
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ 'is-active': view === tab }"
          :aria-selected="view === tab"
          @click="view = tab"
        >
          {{ tUI(`timeline.view.${tab}`) }}
        </button>
      </div>
    </header>

    <div v-if="hasEvents" class="timeline-filters">
      <label class="filter-toggle">
        <input v-model="showEnded" type="checkbox" />
        {{ tUI('timeline.showEnded') }}
      </label>
    </div>

    <EventGantt v-if="view === 'gantt'" :events="visibleEvents" :now="now" />
    <EventList v-else :events="visibleEvents" :show-ended="showEnded" />

    <p v-if="!hasEvents" class="timeline-note">{{ tUI('timeline.emptyHint') }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import EventGantt from '@/components/timeline/EventGantt.vue';
import EventList from '@/components/timeline/EventList.vue';
import { useEvents } from '@/composables/useEvents';
import { useGameStore } from '@/store/game';
import { useLocale } from '@/composables/useLocale';

const TABS = ['gantt', 'list'];
/** Ended events older than this drop off the timeline unless explicitly shown. */
const ENDED_WINDOW_DAYS = 30;

const gameStore = useGameStore();
const { tUI, loadGameLocales } = useLocale();
const { events, hasEvents, now } = useEvents();

// Narrow screens open on the card list; the gantt is still one tap away.
const view = ref(typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'gantt');
const showEnded = ref(false);

const visibleEvents = computed(() => {
  if (showEnded.value) return events.value;

  const cutoff = now.value - ENDED_WINDOW_DAYS * 86400000;
  return events.value.filter((e) => e.status !== 'ended' || e.end >= cutoff);
});

onMounted(async () => {
  gameStore.hydrate();
  await loadGameLocales(gameStore.currentGameId);
});
</script>

<style scoped>
.timeline-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border, #e0e0e0);
}

.timeline-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text, #213547);
  margin: 0;
}

.timeline-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.2rem;
  background: var(--border, #e0e0e0);
  border-radius: 8px;
}

.tab-btn {
  padding: 0.3rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted, #666);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tab-btn.is-active {
  background: var(--bg-surface, #fff);
  color: var(--text, #213547);
}

.timeline-filters {
  display: flex;
  justify-content: flex-end;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted, #666);
  cursor: pointer;
  user-select: none;
}

.timeline-note {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-muted, #888);
}
</style>
