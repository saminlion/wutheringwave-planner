<template>
  <div id="app">
    <header>
      <div class="header-content">
        <h1 class="app-title">{{ tUI('app.title') }}</h1>
        <div class="header-right">
          <GameSelector compact @gameChanged="onGameChanged" />
          <button class="theme-toggle" @click="toggleTheme" :title="themeLabel">
            <span v-if="theme === 'light'">☀️</span>
            <span v-else-if="theme === 'dark'">🌙</span>
            <span v-else>💻</span>
          </button>
        </div>
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
import { computed, onMounted } from 'vue';
import { usePlannerStore } from './store/planner.js';
import { useInventoryStore } from './store/inventory.js';
import { useGameStore } from './store/game.js';
import { useLocale } from '@/composables/useLocale';
import { useTheme } from '@/composables/useTheme';
import GameSelector from './components/common/GameSelector.vue';
import logger from '@/utils/logger';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const gameStore = useGameStore();
const { initLocale, loadGameLocales, tUI } = useLocale();
const { theme, toggleTheme, initTheme } = useTheme();

const themeLabel = computed(() => tUI(`settings.theme.${theme.value}`));

const onGameChanged = (gameId) => {
  logger.debug(`[App] Game changed to: ${gameId}`);
};

onMounted(async () => {
  initTheme();

  const allGameIds = gameStore.enabledGames.map(g => g.id);
  await initLocale(allGameIds);

  const gameId = gameStore.currentGameId || 'wutheringwave';
  plannerStore.hydrate();
  inventoryStore.hydrate(gameId);

  await loadGameLocales(gameId);

  logger.debug(`[App] Data loaded for game: ${gameId}`);
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: var(--text, #2c3e50);
  margin-top: 0;
  min-height: 100vh;
  background-color: var(--bg, #f5f5f7);
}

header {
  background-color: var(--bg-header, #ffffff);
  padding: 10px 16px;
  border-bottom: 1px solid var(--border, #ddd);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.2s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text, #2c3e50);
  white-space: nowrap;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.theme-toggle {
  padding: 4px 8px;
  border: 1.5px solid var(--border, #ddd);
  border-radius: 6px;
  background: var(--bg-surface, #fff);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.theme-toggle:hover {
  border-color: var(--border-focus, #667eea);
  background: var(--bg-surface-hover, #f5f5f5);
}

nav {
  margin-top: 8px;
}

nav a {
  margin: 0 12px;
  text-decoration: none;
  color: var(--link, #42b983);
  font-size: 0.9rem;
}

nav a.router-link-active {
  font-weight: bold;
  color: var(--link-active, #35495e);
}

main {
  /* 1200px 캡 제거 — 넓은 화면에서 양옆 여백 낭비를 없애고 가로를 꽉 채움 */
  padding: 1rem;
}
</style>
