<template>
  <div id="app">
    <header>
      <div class="header-content">
        <h1>Multi-Game Planner</h1>
        <GameSelector />
      </div>
      <nav>
        <router-link to="/">{{ tUI('nav.home') }}</router-link>
        <router-link to="/planner">{{ tUI('nav.planner') }}</router-link>
        <router-link to="/inventory">{{ tUI('nav.inventory') }}</router-link>
        <router-link to="/character">{{ tUI('nav.character') }}</router-link>
        <router-link to="/weapon">{{ tUI('nav.weapon') }}</router-link>
        <router-link to="/settings">{{ tUI('nav.settings') }}</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePlannerStore } from './store/planner.js';
import { useInventoryStore } from './store/inventory.js';
import { useGameStore } from './store/game.js';
import { useLocale } from '@/composables/useLocale';
import GameSelector from './components/common/GameSelector.vue';
import logger from '@/utils/logger';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const gameStore = useGameStore();
const { initLocale, loadGameLocales, tUI } = useLocale();

// Load data from localStorage on app start
onMounted(async () => {
  // Initialize locale first
  await initLocale();

  const gameId = gameStore.currentGameId || 'wutheringwave';
  plannerStore.hydrate();
  inventoryStore.hydrate(gameId);

  // 게임별 번역 파일 로드
  await loadGameLocales(gameId);

  logger.debug(`[App] Data loaded for game: ${gameId}`);
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

header {
  background-color: #f8f9fa;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

header h1 {
  margin: 0;
}

nav {
  margin-top: 10px;
}

nav a {
  margin: 0 15px;
  text-decoration: none;
  color: #42b983;
}

nav a.router-link-active {
  font-weight: bold;
  color: #35495e;
}
</style>
