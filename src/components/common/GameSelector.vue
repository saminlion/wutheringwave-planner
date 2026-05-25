<template>
  <!-- 컴팩트 탭 모드 -->
  <div v-if="compact" class="game-tabs">
    <button
      v-for="game in enabledGames"
      :key="game.id"
      :class="['game-tab', { active: currentGameId === game.id }]"
      @click="selectGame(game.id)"
      :title="getGameName(game)"
    >
      <template v-if="getGameIcon(game)">
        <img :src="getGameIcon(game)" class="game-tab-icon-img" :alt="game.shortName" />
      </template>
      <span v-else class="game-tab-icon">{{ game.icon }}</span>
      <span class="game-tab-shortname">{{ game.shortName }}</span>
    </button>
  </div>

  <!-- 일반 카드 모드 -->
  <div v-else class="game-selector">
    <h2 class="selector-title">{{ tUI('home.selectGame') }}</h2>
    <div class="game-cards">
      <button
        v-for="game in enabledGames"
        :key="game.id"
        :class="['game-card', { active: currentGameId === game.id }]"
        @click="selectGame(game.id)"
      >
        <template v-if="getGameIcon(game)">
          <img :src="getGameIcon(game)" class="game-icon-img" :alt="getGameName(game)" />
        </template>
        <span v-else class="game-icon">{{ game.icon }}</span>
        <span class="game-name">{{ getGameName(game) }}</span>
        <span v-if="currentGameId === game.id" class="selected-badge">
          {{ tUI('common.selected') }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '@/store/game';
import { usePlannerStore } from '@/store/planner';
import { useInventoryStore } from '@/store/inventory';
import { useUserProfileStore } from '@/store/userProfile';
import { useLocale } from '@/composables/useLocale';
import logger from '@/utils/logger';

const props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['gameChanged']);

const gameStore = useGameStore();
const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const userProfileStore = useUserProfileStore();
const { tUI, loadGameLocales } = useLocale();

const currentGameId = computed(() => gameStore.currentGameId);
const enabledGames = computed(() => gameStore.enabledGames);

const getGameName = (game) => {
  const translatedName = tUI(`game.name.${game.id}`);
  if (translatedName === `game.name.${game.id}`) {
    return game.name;
  }
  return translatedName;
};

const getGameIcon = (game) => {
  const url = tUI(`game.icon.${game.id}`);
  return url !== `game.icon.${game.id}` ? url : null;
};

const selectGame = async (gameId) => {
  if (gameId === currentGameId.value) return;

  const success = gameStore.switchGame(gameId);
  if (success) {
    plannerStore.hydrate(gameId);
    inventoryStore.hydrate(gameId);
    userProfileStore.hydrate(gameId);

    await loadGameLocales(gameId);

    logger.info(`Game switched to: ${gameId}`);
    emit('gameChanged', gameId);
  }
};
</script>

<style scoped>
/* --- Compact Tab Mode --- */
.game-tabs {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.game-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1.5px solid var(--border, #ddd);
  border-radius: 6px;
  background: var(--bg-surface, #fff);
  color: var(--text, #333);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.game-tab:hover {
  border-color: var(--border-focus, #667eea);
  background: var(--bg-surface-hover, #f5f5f5);
}

.game-tab.active {
  border-color: var(--border-focus, #667eea);
  background: color-mix(in srgb, var(--border-focus, #667eea) 15%, var(--bg-surface, #fff));
  color: var(--border-focus, #667eea);
  font-weight: 600;
}

.game-tab-icon {
  font-size: 1rem;
  line-height: 1;
}

.game-tab-icon-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.game-tab-shortname {
  line-height: 1;
}

/* --- Normal Card Mode --- */
.game-selector {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.selector-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text, #333);
  font-size: 1.5rem;
}

.game-cards {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 12px;
  background: var(--bg-surface, white);
  color: var(--text, #333);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 110px;
  position: relative;
}

.game-card:hover {
  border-color: var(--border-focus, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.game-card.active {
  border-color: var(--border-focus, #667eea);
  background: color-mix(in srgb, var(--border-focus, #667eea) 10%, var(--bg-surface, #fff));
}

.game-icon {
  font-size: 2rem;
}

.game-icon-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.game-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text, #333);
  text-align: center;
}

.selected-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.65rem;
  padding: 0.2rem 0.45rem;
  border-radius: 8px;
}
</style>
