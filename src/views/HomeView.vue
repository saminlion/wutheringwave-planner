<template>
  <div class="home-view">
    <!-- 사용 가이드 -->
    <div v-if="guide" class="guide-section">
      <h2 class="guide-title">{{ guide.title }}</h2>

      <div class="guide-steps">
        <div v-for="step in guide.steps" :key="step.step" class="guide-step">
          <div class="step-number">{{ step.step }}</div>
          <div class="step-content">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="guide.notes && guide.notes.length" class="guide-notes">
        <p v-for="(note, i) in guide.notes" :key="i" class="guide-note">
          💡 {{ note }}
        </p>
      </div>
    </div>

    <!-- 게임 미선택 시 안내 -->
    <div v-else class="guide-placeholder">
      <p>{{ tUI('home.selectGame') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { usePlannerStore } from '@/store/planner';
import { useInventoryStore } from '@/store/inventory';
import { useGameStore } from '@/store/game';
import { useUserProfileStore } from '@/store/userProfile';
import { useLocale } from '@/composables/useLocale';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const gameStore = useGameStore();
const userProfileStore = useUserProfileStore();
const { tUI, loadGameLocales, currentTranslations } = useLocale();

const guide = computed(() => currentTranslations.value?.guide ?? null);

onMounted(async () => {
  gameStore.hydrate();
  const gameId = gameStore.currentGameId;
  plannerStore.hydrate(gameId);
  inventoryStore.hydrate(gameId);
  userProfileStore.hydrate(gameId);

  await loadGameLocales(gameId);
});
</script>

<style scoped>
.home-view {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
  text-align: left;
}

.guide-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.guide-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text, #213547);
  margin: 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border, #e0e0e0);
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.guide-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 10px;
  transition: border-color 0.15s;
}

.guide-step:hover {
  border-color: var(--border-focus, #667eea);
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary, #667eea), var(--primary-end, #764ba2));
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text, #213547);
  margin: 0 0 0.25rem;
}

.step-desc {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  margin: 0;
  line-height: 1.5;
}

.guide-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: color-mix(in srgb, var(--primary, #667eea) 8%, var(--bg-surface, #fff));
  border-left: 3px solid var(--primary, #667eea);
  border-radius: 0 8px 8px 0;
}

.guide-note {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  margin: 0;
  line-height: 1.5;
}

.guide-placeholder {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted, #888);
}
</style>
