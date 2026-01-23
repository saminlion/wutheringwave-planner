<template>
  <div class="cloud-sync">
    <h3>Cloud Sync</h3>

    <!-- Not configured warning -->
    <div v-if="!isAvailable" class="warning-box">
      <p>Cloud sync is not configured.</p>
      <p class="hint">Set Firebase environment variables to enable.</p>
    </div>

    <!-- Auth section -->
    <div v-else class="sync-content">
      <!-- Not signed in -->
      <div v-if="!user" class="auth-section">
        <p>Sign in to sync your data across devices.</p>
        <button
          class="google-btn"
          @click="handleSignIn"
          :disabled="loading"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      </div>

      <!-- Signed in -->
      <div v-else class="user-section">
        <div class="user-info">
          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            :alt="user.displayName"
            class="user-avatar"
          />
          <div class="user-details">
            <span class="user-name">{{ user.displayName }}</span>
            <span class="user-email">{{ user.email }}</span>
          </div>
          <button class="sign-out-btn" @click="handleSignOut" :disabled="loading">
            Sign Out
          </button>
        </div>

        <!-- Cloud data info -->
        <div v-if="cloudInfo" class="cloud-info">
          <p>Last synced: {{ formatDate(cloudInfo.lastUpdated) }}</p>
          <p>Items in cloud: {{ cloudInfo.itemCount }}</p>
        </div>

        <!-- Sync actions -->
        <div class="sync-actions">
          <button
            class="sync-btn save"
            @click="handleSave"
            :disabled="loading"
          >
            {{ loading ? 'Saving...' : 'Save to Cloud' }}
          </button>
          <button
            class="sync-btn load"
            @click="handleLoad"
            :disabled="loading"
          >
            {{ loading ? 'Loading...' : 'Load from Cloud' }}
          </button>
        </div>

        <!-- Status message -->
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import cloudSync from '@/services/cloudSync';

const isAvailable = ref(cloudSync.isCloudSyncAvailable());
const user = ref(null);
const cloudInfo = ref(null);
const loading = ref(false);
const message = ref('');
const messageType = ref('info');

let unsubscribe = null;

onMounted(() => {
  if (isAvailable.value) {
    cloudSync.initAuthListener();
    unsubscribe = cloudSync.onAuthChange(async (newUser) => {
      user.value = newUser;
      if (newUser) {
        await fetchCloudInfo();
      } else {
        cloudInfo.value = null;
      }
    });
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

async function fetchCloudInfo() {
  try {
    cloudInfo.value = await cloudSync.getCloudDataInfo();
  } catch (error) {
    console.error('Failed to fetch cloud info:', error);
  }
}

async function handleSignIn() {
  loading.value = true;
  message.value = '';
  try {
    await cloudSync.signInWithGoogle();
  } catch (error) {
    showMessage('Sign in failed: ' + error.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function handleSignOut() {
  loading.value = true;
  try {
    await cloudSync.signOut();
  } catch (error) {
    showMessage('Sign out failed: ' + error.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  loading.value = true;
  message.value = '';
  try {
    await cloudSync.saveToCloud();
    await fetchCloudInfo();
    showMessage('Data saved to cloud successfully!', 'success');
  } catch (error) {
    showMessage('Save failed: ' + error.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function handleLoad() {
  if (!confirm('This will overwrite your local data. Continue?')) {
    return;
  }

  loading.value = true;
  message.value = '';
  try {
    const result = await cloudSync.loadFromCloud();
    if (result) {
      showMessage(`Loaded ${result.itemCount} items. Refresh to apply.`, 'success');
    } else {
      showMessage('No cloud data found.', 'info');
    }
  } catch (error) {
    showMessage('Load failed: ' + error.message, 'error');
  } finally {
    loading.value = false;
  }
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
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.cloud-sync h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.warning-box {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 15px;
}

.warning-box p {
  margin: 0;
}

.hint {
  font-size: 0.85em;
  color: #856404;
  margin-top: 5px !important;
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
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.google-btn:hover:not(:disabled) {
  background: #f5f5f5;
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
  background: white;
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
  color: #666;
}

.sign-out-btn {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.sign-out-btn:hover:not(:disabled) {
  background: #c82333;
}

.cloud-info {
  padding: 10px;
  background: #e9ecef;
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
  background: #28a745;
  color: white;
}

.sync-btn.save:hover:not(:disabled) {
  background: #218838;
}

.sync-btn.load {
  background: #007bff;
  color: white;
}

.sync-btn.load:hover:not(:disabled) {
  background: #0069d9;
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
  background: #d4edda;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}

.message.info {
  background: #d1ecf1;
  color: #0c5460;
}
</style>
