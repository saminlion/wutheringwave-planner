<template>
  <div class="game-visibility card">
    <div class="card-header">
      <span class="card-icon">🎮</span>
      <h3>{{ tUI('settings.games') }}</h3>
    </div>
    <div class="card-content">
      <p class="description">{{ tUI('settings.games.description') }}</p>
      <div class="game-options">
        <label
          v-for="game in gameStore.enabledGames"
          :key="game.id"
          :class="['game-option', { visible: isVisible(game.id), locked: isLastVisible(game.id) }]"
          :title="isLastVisible(game.id) ? tUI('settings.games.lastOne') : ''"
        >
          <input
            type="checkbox"
            :checked="isVisible(game.id)"
            :disabled="isLastVisible(game.id)"
            @change="toggle(game.id, $event.target.checked)"
          />
          <img v-if="getGameIcon(game)" :src="getGameIcon(game)" class="game-icon-img" :alt="game.shortName" />
          <span v-else class="game-icon">{{ game.icon }}</span>
          <span class="game-name">{{ getGameName(game) }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/store/game';
import { useLocale } from '@/composables/useLocale';
import { useGameSwitch } from '@/composables/useGameSwitch';

const gameStore = useGameStore();
const { tUI } = useLocale();
const { switchTo } = useGameSwitch();

const isVisible = (gameId) => !gameStore.hiddenGameIds.includes(gameId);
// The last shown game can't be hidden: the app always needs a current game.
const isLastVisible = (gameId) => isVisible(gameId) && gameStore.visibleGames.length === 1;

const getGameName = (game) => {
  const translated = tUI(`game.name.${game.id}`);
  return translated === `game.name.${game.id}` ? game.name : translated;
};

const getGameIcon = (game) => {
  const url = tUI(`game.icon.${game.id}`);
  return url !== `game.icon.${game.id}` ? url : null;
};

async function toggle(gameId, visible) {
  if (!gameStore.setGameHidden(gameId, !visible)) return;
  // Hiding the game on screen moves the app to the first one still shown
  if (!visible && gameStore.currentGameId === gameId) {
    await switchTo(gameStore.visibleGames[0].id);
  }
}
</script>

<style scoped>
.game-visibility {
  width: 100%;
  max-width: 480px;
  margin-bottom: 1rem;
}

.card {
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-icon {
  font-size: 1.25rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-content {
  padding: 1.25rem;
}

.description {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: left;
}

.game-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}

.game-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.55;
  text-align: left;
  transition: all 0.2s ease;
}

.game-option.visible {
  border-color: var(--primary);
  opacity: 1;
}

.game-option.locked {
  cursor: not-allowed;
}

.game-option:hover:not(.locked) {
  background: var(--bg-surface-hover);
}

.game-icon-img {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
}

.game-icon {
  font-size: 1.25rem;
}

.game-name {
  font-size: 0.9rem;
  color: var(--text);
}
</style>
