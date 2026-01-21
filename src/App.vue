<template>
  <div id="app">
    <header>
      <div class="header-content">
        <h1>Multi-Game Planner</h1>
        <GameSelector />
      </div>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/planner">Planner</router-link>
        <router-link to="/inventory">Inventory</router-link>
        <router-link to="/character">Character</router-link>
        <router-link to="/weapon">Weapon</router-link>
        <router-link to="/endfield-data">Endfield Data</router-link>
        <router-link to="/settings">Settings</router-link>
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
import { useGameRegistryStore } from './store/gameRegistry.js';
import GameSelector from './components/common/GameSelector.vue';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const gameRegistry = useGameRegistryStore();

// Load data from localStorage on app start
onMounted(() => {
  const gameId = gameRegistry.currentGameId || 'wutheringwave';
  plannerStore.hydrate();
  inventoryStore.hydrate(gameId);
  console.log(`[App] Data loaded for game: ${gameId}`);
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
