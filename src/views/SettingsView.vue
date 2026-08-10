<template>
  <div class="settings-view">
    <h1>{{ tUI('nav.settings') }}</h1>
    <p class="settings-description">
      Manage your planner data - sync to cloud or backup locally.
    </p>

    <section class="settings-section">
      <LanguageSelector />
    </section>

    <!-- Games with no stamina resource (config.stamina = null) have nothing to set -->
    <section class="settings-section" v-if="hasStamina">
      <StaminaSetting />
    </section>

    <section class="settings-section">
      <CloudSync />
    </section>

    <section class="settings-section">
      <DataBackup />
    </section>
  </div>
</template>

<script setup>
import DataBackup from '@/components/common/DataBackup.vue';
import CloudSync from '@/components/settings/CloudSync.vue';
import LanguageSelector from '@/components/settings/LanguageSelector.vue';
import StaminaSetting from '@/components/settings/StaminaSetting.vue';
import { computed } from 'vue';
import { useGameStore } from '@/store/game';
import { useLocale } from '@/composables/useLocale';

const { tUI } = useLocale();
const gameStore = useGameStore();
const hasStamina = computed(() => Boolean(gameStore.currentGame?.config?.stamina));
</script>

<style scoped>
.settings-view {
  max-width: 960px;
  margin: 0 auto;
  text-align: left;
  padding: 1.5rem 1rem;
}

.settings-description {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.settings-section {
  display: flex;
  justify-content: center;
}
</style>
