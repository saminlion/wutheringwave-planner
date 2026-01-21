<template>
  <div id="app">
    <header>
      <h1>Wuthering Waves Planner</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/planner">Planner</router-link>
        <router-link to="/inventory">Inventory</router-link>
        <router-link to="/character">Character</router-link>
        <router-link to="/weapon">Weapon</router-link>
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

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();

// 앱 시작 시 localStorage에서 데이터 복원
onMounted(() => {
  const gameId = 'wutheringwave';
  plannerStore.hydrate();
  inventoryStore.hydrate(gameId);
  console.log('[App] Data loaded from localStorage');
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
