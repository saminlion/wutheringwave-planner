<template>
  <div class="settings-view">
    <h1>Settings</h1>
    <p class="settings-description">
      Manage your planner data - sync to cloud or backup locally.
    </p>

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
</script>

<style scoped>
.settings-view {
  max-width: 960px;
  margin: 0 auto;
  text-align: left;
  padding: 1.5rem 1rem;
}

.settings-description {
  color: #4a4a4a;
  margin-bottom: 1rem;
}

.settings-section {
  display: flex;
  justify-content: center;
}
</style>
