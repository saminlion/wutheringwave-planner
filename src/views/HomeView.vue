<template>
  <div>
    <h1>Welcome to the Planner</h1>
    <!-- 게임 선택 드롭다운 -->
    <div>
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
import { useInventoryStore } from '../store/inventory';

// Pinia Store
const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();

const selectedGame = ref('wutheringwave'); // 기본 게임 ID

// 게임 변경 함수
const changeGame = () => {
  plannerStore.hydrate();
  inventoryStore.hydrate(selectedGame.value);
};

// 초기 로드
onMounted(() => {
  plannerStore.hydrate();
  inventoryStore.hydrate(selectedGame.value);
});
</script>