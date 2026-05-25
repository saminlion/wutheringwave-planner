<template>
  <div class="data-backup">
    <div class="backup-section">
      <h3>Data Backup & Restore</h3>

      <div class="storage-info" v-if="storageInfo">
        <p class="info-text">
          Storage Used: {{ storageInfo.gameplannerMB }}MB / {{ storageInfo.totalMB }}MB
          ({{ storageInfo.percentage.toFixed(1) }}%)
        </p>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${Math.min(storageInfo.percentage, 100)}%` }"
            :class="{ warning: storageInfo.percentage > 80, danger: storageInfo.percentage > 90 }"
          ></div>
        </div>
      </div>

      <div class="actions">
        <div class="action-group">
          <button @click="handleBackup" class="btn btn-primary" :disabled="isProcessing">
            <span v-if="!isProcessing">📥 Download Backup</span>
            <span v-else>Processing...</span>
          </button>
          <p class="action-desc">Save current data as a JSON file</p>
        </div>

        <div class="action-group">
          <label for="restore-file" class="btn btn-secondary" :class="{ disabled: isProcessing }">
            <span v-if="!isProcessing">📤 Restore Backup</span>
            <span v-else>Processing...</span>
          </label>
          <input
            id="restore-file"
            type="file"
            accept=".json"
            @change="handleRestore"
            style="display: none"
            :disabled="isProcessing"
          />
          <p class="action-desc">Restore data from a backup file</p>
        </div>

        <div class="action-group">
          <button @click="handleClear" class="btn btn-danger" :disabled="isProcessing">
            <span v-if="!isProcessing">🗑️ Clear All</span>
            <span v-else>Processing...</span>
          </button>
          <p class="action-desc">Delete all stored data (cannot be undone)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import storage from '@/utils/storage';
import logger from '@/utils/logger';

const storageInfo = ref(null);
const isProcessing = ref(false);

const loadStorageInfo = () => {
  storageInfo.value = storage.getStorageInfo();
};

const handleBackup = async () => {
  isProcessing.value = true;
  try {
    const success = storage.backupData();
    if (success) {
      toast.success('Backup file downloaded successfully');
      logger.info('Data backup created');
    } else {
      toast.error('Failed to create backup');
    }
  } catch (error) {
    toast.error('Error occurred during backup');
    logger.error('Backup error:', error);
  } finally {
    isProcessing.value = false;
  }
};

const handleRestore = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!confirm('⚠️ This will overwrite current data with the backup file. Continue?')) {
    event.target.value = '';
    return;
  }

  isProcessing.value = true;
  try {
    const success = await storage.restoreData(file);
    if (success) {
      toast.success('Data restored successfully. Refreshing page...');
      logger.info('Data restored from backup');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error('Failed to restore data');
    }
  } catch (error) {
    toast.error('Error occurred during restore');
    logger.error('Restore error:', error);
  } finally {
    isProcessing.value = false;
    event.target.value = '';
  }
};

const handleClear = async () => {
  if (!confirm('⚠️ Delete all data? This action cannot be undone.')) {
    return;
  }

  if (!confirm('⚠️⚠️ Are you sure? Have you backed up your data first?')) {
    return;
  }

  isProcessing.value = true;
  try {
    const success = storage.clearStorage();
    if (success) {
      toast.success('All data deleted. Refreshing page...');
      logger.info('All data cleared');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error('Failed to delete data');
    }
  } catch (error) {
    toast.error('Error occurred during deletion');
    logger.error('Clear error:', error);
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  loadStorageInfo();
});
</script>

<style scoped>
.data-backup {
  max-width: 600px;
  margin: 0 auto;
}

.backup-section {
  background: var(--bg-surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 20px 0;
  color: var(--text);
  font-size: 20px;
}

.storage-info {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-subtle);
  border-radius: 6px;
}

.info-text {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--text-muted);
}

.progress-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-success);
  transition: width 0.3s ease, background-color 0.3s ease;
}

.progress-fill.warning {
  background: var(--color-warning);
}

.progress-fill.danger {
  background: var(--color-danger);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  padding-left: 4px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn:disabled,
.btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-info);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-info);
  filter: brightness(0.9);
}

.btn-secondary {
  background: var(--color-success);
  color: white;
}

.btn-secondary:hover:not(:disabled):not(.disabled) {
  background: var(--color-success);
  filter: brightness(0.9);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-danger);
  filter: brightness(0.9);
}

@media (max-width: 640px) {
  .backup-section {
    padding: 16px;
  }

  h3 {
    font-size: 18px;
  }
}
</style>
