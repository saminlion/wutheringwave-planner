<template>
  <div class="game-selector">
    <h2 class="selector-title">{{ tUI('home.selectGame') }}</h2>
    <div class="game-cards">
      <button
        v-for="game in enabledGames"
        :key="game.id"
        :class="['game-card', { active: currentGameId === game.id }]"
        @click="selectGame(game.id)"
      >
        <span class="game-icon">{{ game.icon }}</span>
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

const emit = defineEmits(['gameChanged']);

const gameStore = useGameStore();
const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const userProfileStore = useUserProfileStore();
const { tUI, loadGameLocales } = useLocale();

const currentGameId = computed(() => gameStore.currentGameId);
const enabledGames = computed(() => gameStore.enabledGames);

// 게임 이름을 번역된 값으로 반환 (번역이 없으면 config의 name 사용)
const getGameName = (game) => {
  const translatedName = tUI(`game.name.${game.id}`);
  // tUI는 키를 찾지 못하면 키 자체를 반환
  if (translatedName === `game.name.${game.id}`) {
    return game.name;
  }
  return translatedName;
};

const selectGame = async (gameId) => {
  if (gameId === currentGameId.value) return;

  const success = gameStore.switchGame(gameId);
  if (success) {
    // 다른 스토어들도 새 게임으로 hydrate
    plannerStore.hydrate(gameId);
    inventoryStore.hydrate(gameId);
    userProfileStore.hydrate(gameId);

    // 게임별 번역 파일 로드
    await loadGameLocales(gameId);

    logger.info(`Game switched to: ${gameId}`);
    emit('gameChanged', gameId);
  }
};
</script>

<style scoped>
.game-selector {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.selector-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
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
  padding: 1.5rem 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
  position: relative;
}

.game-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.game-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.game-icon {
  font-size: 2.5rem;
}

.game-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.selected-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}
</style>
