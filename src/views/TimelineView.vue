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
      <label class="filter-toggle">
        <input v-model="showCompleted" type="checkbox" />
        {{ tUI('timeline.showCompleted') }}
        <span v-if="completed.length" class="filter-count">{{ completed.length }}</span>
      </label>
    </div>

    <EventGantt
      v-if="view === 'gantt'"
      :events="visibleEvents"
      :now="now"
      @toggle-complete="onToggleComplete"
    />
    <EventList
      v-else
      :events="visibleEvents"
      :show-ended="showEnded"
      @toggle-complete="onToggleComplete"
    />

    <p v-if="!hasEvents" class="timeline-note">{{ tUI('timeline.emptyHint') }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import EventGantt from '@/components/timeline/EventGantt.vue';
import EventList from '@/components/timeline/EventList.vue';
import { useEvents } from '@/composables/useEvents';
import { useGameStore } from '@/store/game';
import { useLocale } from '@/composables/useLocale';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

const TABS = ['gantt', 'list'];
/** Ended events older than this drop off the timeline unless explicitly shown. */
const ENDED_WINDOW_DAYS = 30;
/** View preferences are the same whichever game is selected, so they are not game-scoped. */
const PREFS_KEY = 'timeline_prefs';

const gameStore = useGameStore();
const { tUI, loadGameLocales } = useLocale();
const { events, active, completed, hasEvents, now, toggleComplete } = useEvents();

const prefs = loadFromStorage(PREFS_KEY, null) || {};

// Narrow screens open on the card list; the gantt is still one tap away.
const view = ref(
  TABS.includes(prefs.view)
    ? prefs.view
    : (typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'gantt'),
);
const showEnded = ref(prefs.showEnded === true);
const showCompleted = ref(prefs.showCompleted === true);

// Survives a route change or a reload — the tab used to reset to the default every time.
watch([view, showEnded, showCompleted], () => {
  saveToStorage(PREFS_KEY, {
    view: view.value,
    showEnded: showEnded.value,
    showCompleted: showCompleted.value,
  });
});

const visibleEvents = computed(() => {
  // `active` already drops the events ticked off by hand.
  let list = showCompleted.value ? events.value : active.value;

  if (!showEnded.value) {
    const cutoff = now.value - ENDED_WINDOW_DAYS * 86400000;
    list = list.filter((e) => e.status !== 'ended' || e.end >= cutoff);
  }

  return list;
});

const onToggleComplete = (event) => toggleComplete(event.id);

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
  /* Own stacking context: the gantt's layered bars and markers can never paint
     over the app's sticky header, however high their local z-index climbs. */
  isolation: isolate;
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
  flex-wrap: wrap;
  gap: 0.9rem;
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

.filter-count {
  font-size: 0.7rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: var(--border, #e0e0e0);
  color: var(--text-muted, #666);
}

.timeline-note {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-muted, #888);
}
</style>
