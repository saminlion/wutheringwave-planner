<template>
  <div class="cloud-sync">
    <h3>Cloud Sync</h3>

    <!-- Not linked -->
    <div v-if="!state.connected" class="auth-section">
      <p>Sign in to sync your data across devices through your Google Drive.</p>
      <p class="hint">Stored in a hidden app folder — this app cannot see any of your other files.</p>
      <button class="google-btn" @click="handleConnect" :disabled="loading">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
    </div>

    <!-- Linked -->
    <div v-else class="user-section">
      <div class="user-info">
        <img
          v-if="state.user?.photo"
          :src="state.user.photo"
          :alt="state.user.name"
          class="user-avatar"
          referrerpolicy="no-referrer"
        />
        <div class="user-details">
          <span class="user-name">{{ state.user?.name }}</span>
          <span class="user-email">{{ state.user?.email }}</span>
        </div>
        <button class="sign-out-btn" @click="handleDisconnect" :disabled="loading">
          Sign Out
        </button>
      </div>

      <div class="cloud-info">
        <p>Status: <strong>{{ statusLabel }}</strong></p>
        <p>Last synced: {{ formatDate(state.lastSyncedAt) }}</p>
        <p v-if="state.status === 'error'" class="error-text">{{ state.error }}</p>
      </div>

      <!-- Both sides changed since the last sync: the user picks, nothing is guessed -->
      <div v-if="state.status === 'conflict'" class="conflict-box">
        <p>This device and Google Drive both changed since the last sync.</p>
        <p class="hint">Drive copy saved: {{ formatDate(conflict?.cloudUpdatedAt) }}</p>
        <div class="sync-actions">
          <button class="sync-btn load" @click="handleResolve('cloud')" :disabled="loading">
            Use Drive data
          </button>
          <button class="sync-btn save" @click="handleResolve('local')" :disabled="loading">
            Keep this device
          </button>
        </div>
      </div>

      <div v-else class="sync-actions">
        <button
          v-if="!state.authorized"
          class="sync-btn load"
          @click="handleConnect"
          :disabled="loading"
        >
          Reconnect
        </button>
        <button
          v-else
          class="sync-btn save"
          @click="handleSync"
          :disabled="loading || state.status === 'syncing'"
        >
          {{ state.status === 'syncing' ? 'Syncing...' : 'Sync now' }}
        </button>
      </div>

      <p class="hint">Changes sync automatically while this tab is open.</p>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  syncState as state,
  connect,
  disconnect,
  syncNow,
  resolveConflict,
  getConflictInfo,
} from '@/services/cloudSync';
import { useConfirm } from '@/composables/useConfirm';

const { confirmDialog } = useConfirm();

const loading = ref(false);
const message = ref('');
const messageType = ref('info');

// getConflictInfo() is plain data; re-read it whenever the status flips.
const conflict = computed(() => (state.status === 'conflict' ? getConflictInfo() : null));

const statusLabel = computed(() => {
  if (!state.authorized) return 'Paused — reconnect to resume';
  return {
    idle: 'Up to date',
    syncing: 'Syncing...',
    conflict: 'Needs your choice',
    error: 'Error',
  }[state.status];
});

async function run(task, failPrefix) {
  loading.value = true;
  message.value = '';
  try {
    await task();
  } catch (error) {
    showMessage(`${failPrefix}: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

const handleConnect = () => run(connect, 'Sign in failed');
const handleSync = () => run(syncNow, 'Sync failed');

async function handleDisconnect() {
  if (!(await confirmDialog('Stop syncing on this device? Data here and on Google Drive is kept.'))) return;
  await run(disconnect, 'Sign out failed');
}

async function handleResolve(keep) {
  const text = keep === 'cloud'
    ? 'Replace this device\'s data with the Google Drive copy?'
    : 'Overwrite the Google Drive copy with this device\'s data?';
  if (!(await confirmDialog(text, { danger: true }))) return;
  await run(() => resolveConflict(keep), 'Sync failed');
}

function showMessage(msg, type = 'info') {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
}

function formatDate(date) {
  if (!date) return 'Never';
  return new Date(date).toLocaleString();
}
</script>

<style scoped>
.cloud-sync {
  background: var(--bg-subtle);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.cloud-sync h3 {
  margin: 0 0 15px 0;
  color: var(--text);
}

.hint {
  font-size: 0.85em;
  color: var(--text-muted);
  margin: 5px 0 0 0;
}

.auth-section {
  text-align: center;
  padding: 20px;
}

.google-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.google-btn:hover:not(:disabled) {
  background: var(--bg-surface-hover);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: var(--bg-surface);
  border-radius: 4px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
}

.user-email {
  font-size: 0.85em;
  color: var(--text-muted);
}

.sign-out-btn {
  padding: 6px 12px;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.sign-out-btn:hover:not(:disabled) {
  background: var(--color-danger);
  filter: brightness(0.9);
}

.cloud-info {
  padding: 10px;
  background: var(--bg-subtle);
  border-radius: 4px;
  font-size: 0.9em;
}

.cloud-info p {
  margin: 5px 0;
}

.sync-actions {
  display: flex;
  gap: 10px;
}

.sync-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.sync-btn.save {
  background: var(--color-success);
  color: white;
}

.sync-btn.save:hover:not(:disabled) {
  background: var(--color-success);
  filter: brightness(0.9);
}

.sync-btn.load {
  background: var(--color-info);
  color: white;
}

.sync-btn.load:hover:not(:disabled) {
  background: var(--color-info);
  filter: brightness(0.9);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.message.success {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.message.error {
  background: color-mix(in srgb, var(--color-danger) 15%, var(--bg-surface));
  color: var(--color-danger);
}

.conflict-box {
  padding: 12px;
  border: 1px solid var(--color-warning);
  background: var(--color-warning-bg);
  border-radius: 4px;
}

.conflict-box p {
  margin: 0 0 8px 0;
}

.error-text {
  color: var(--color-danger);
}

.message {
  margin-top: 15px;
}

.message.info {
  background: var(--color-info-bg);
  color: var(--color-info);
}
</style>
