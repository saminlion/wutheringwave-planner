<template>
  <div>
    <h1>Welcome to the Planner</h1>
    <!-- 게임 선택 드롭다운 -->
    <div>
      <label for="game-select">Select Your Game:</label>
      <select id="game-select" v-model="selectedGame" @change="changeGame">
        <option value="genshin">Genshin Impact</option>
        <option value="starrail">Honkai: Star Rail</option>
      </select>
    </div>

    <div v-if="selectedGame">
      <p>Selected Game: {{ selectedGame }}</p>
      <router-link to="/planner">Go to Planner</router-link>
      <router-link to="/character">Character Selection</router-link>
      <router-link to="/weapon">Weapon Selection</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePlannerStore } from '../store/planner';

// Reactive Variables
const selectedGame = ref(localStorage.getItem('selectedGame') || 'genshin'); // 기본값 Genshin Impact

// Pinia Store
const plannerStore = usePlannerStore();

// 게임 변경 함수
const changeGame = () => {
  localStorage.setItem('selectedGame', selectedGame.value);
  plannerStore.hydrate(selectedGame.value);
};

// 초기 로드
onMounted(() => {
  plannerStore.hydrate(selectedGame.value);

  plannerStore.loadGoals(selectedGame.value);
});
</script>