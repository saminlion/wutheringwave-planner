<template>
  <div class="home-view">
    <h1 class="home-title">{{ tUI('home.welcome') }}</h1>

    <!-- 게임 선택 -->
    <GameSelector @gameChanged="onGameChanged" />

    <!-- 네비게이션 -->
    <div class="nav-cards">
      <router-link to="/planner" class="nav-card">
        <span class="nav-icon">📋</span>
        <span class="nav-label">{{ tUI('nav.planner') }}</span>
      </router-link>
      <router-link to="/character" class="nav-card">
        <span class="nav-icon">👤</span>
        <span class="nav-label">{{ tUI('nav.character') }}</span>
      </router-link>
      <router-link to="/weapon" class="nav-card">
        <span class="nav-icon">⚔️</span>
        <span class="nav-label">{{ tUI('nav.weapon') }}</span>
      </router-link>
      <router-link to="/inventory" class="nav-card">
        <span class="nav-icon">🎒</span>
        <span class="nav-label">{{ tUI('nav.inventory') }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { usePlannerStore } from '@/store/planner';
import { useInventoryStore } from '@/store/inventory';
import { useGameStore } from '@/store/game';
import { useUserProfileStore } from '@/store/userProfile';
import { useLocale } from '@/composables/useLocale';
import GameSelector from '@/components/common/GameSelector.vue';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const gameStore = useGameStore();
const userProfileStore = useUserProfileStore();
const { tUI, loadGameLocales } = useLocale();

const onGameChanged = (gameId) => {
  // GameSelector에서 이미 hydrate 처리됨
};

onMounted(async () => {
  // 초기 로드
  gameStore.hydrate();
  const gameId = gameStore.currentGameId;
  plannerStore.hydrate(gameId);
  inventoryStore.hydrate(gameId);
  userProfileStore.hydrate(gameId);

  // 게임별 번역 파일 로드
  await loadGameLocales(gameId);
});
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.home-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  text-decoration: none;
  color: #333;
  transition: all 0.2s ease;
}

.nav-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.nav-icon {
  font-size: 2rem;
}

.nav-label {
  font-weight: 600;
}
</style>
