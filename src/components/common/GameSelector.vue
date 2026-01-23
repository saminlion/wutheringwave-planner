<template>
  <div class="game-selector">
    <label for="game-select">Game:</label>
    <select id="game-select" v-model="selectedGame" @change="switchGame" class="game-select">
      <option v-for="game in availableGames" :key="game.id" :value="game.id">
        {{ game.displayName || game.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGameRegistryStore } from '@/store/gameRegistry';
import { toast } from 'vue3-toastify';
import logger from '@/utils/logger';

const gameRegistry = useGameRegistryStore();

const selectedGame = ref(gameRegistry.currentGameId);
const availableGames = computed(() => gameRegistry.allGames);

const switchGame = () => {
  const success = gameRegistry.setCurrentGame(selectedGame.value);
  if (success) {
    const gameName = gameRegistry.currentGame?.displayName || selectedGame.value;
    toast.success(`Switched to ${gameName}`);
    logger.info(`Game switched to: ${selectedGame.value}`);

    // Reload page to reinitialize with new game data
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    toast.error('Failed to switch game');
    selectedGame.value = gameRegistry.currentGameId; // Revert
  }
};

onMounted(() => {
  selectedGame.value = gameRegistry.currentGameId;
});
</script>

<style scoped>
.game-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

label {
  font-weight: 500;
  color: #333;
}

.game-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.game-select:hover {
  border-color: #2196f3;
}

.game-select:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}
</style>
