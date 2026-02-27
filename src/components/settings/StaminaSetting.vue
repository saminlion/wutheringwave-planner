<template>
  <div class="stamina-setting card">
    <div class="card-header">
      <span class="card-icon">⚡</span>
      <h3>Daily {{ staminaName }}</h3>
    </div>
    <div class="card-content">
      <p class="setting-description">
        Set how much {{ staminaName }} you can spend per day. This affects the estimated days calculation.
      </p>
      <div class="stamina-input-row">
        <input
          type="number"
          :value="displayValue"
          :placeholder="String(defaultValue)"
          min="1"
          max="9999"
          class="stamina-input"
          @input="onInput"
        />
        <span class="stamina-unit">/ day</span>
        <button
          v-if="isCustom"
          class="reset-btn"
          @click="reset"
        >
          Reset
        </button>
      </div>
      <p v-if="!isCustom" class="default-hint">
        Using default: {{ defaultValue }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserProfileStore } from '@/store/userProfile';
import { useGameStore } from '@/store/game';

const userProfileStore = useUserProfileStore();
const gameStore = useGameStore();

const staminaName = computed(() => userProfileStore.staminaName);

const defaultValue = computed(() => {
  return gameStore.currentGameConfig?.stamina?.dailyLimit ?? 240;
});

const isCustom = computed(() => {
  const custom = userProfileStore.currentProfile?.dailyStamina;
  return custom != null && custom > 0;
});

const displayValue = computed(() => {
  if (isCustom.value) {
    return userProfileStore.currentProfile.dailyStamina;
  }
  return '';
});

function onInput(event) {
  const val = parseInt(event.target.value, 10);
  if (!isNaN(val) && val > 0) {
    userProfileStore.setDailyStamina(val);
  } else if (event.target.value === '') {
    userProfileStore.setDailyStamina(null);
  }
}

function reset() {
  userProfileStore.setDailyStamina(null);
}
</script>

<style scoped>
.stamina-setting {
  width: 100%;
  max-width: 480px;
  margin-bottom: 1rem;
}

.card {
  background: white;
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

.setting-description {
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.9rem;
}

.stamina-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stamina-input {
  width: 120px;
  padding: 0.6rem 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
  transition: border-color 0.2s ease;
}

.stamina-input:focus {
  outline: none;
  border-color: #667eea;
}

.stamina-input::placeholder {
  color: #bbb;
}

.stamina-unit {
  color: #666;
  font-size: 0.95rem;
}

.reset-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.default-hint {
  margin: 0.5rem 0 0;
  color: #999;
  font-size: 0.8rem;
}
</style>
