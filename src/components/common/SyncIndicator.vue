<template>
  <!-- Header badge for Google Drive sync; hidden until the user links an account -->
  <router-link
    v-if="state.connected"
    to="/settings"
    class="sync-indicator"
    :class="`is-${view.kind}`"
    :title="view.label"
    :aria-label="view.label"
  >
    <span class="cloud" aria-hidden="true">☁️</span>
    <span class="badge" aria-hidden="true">{{ view.badge }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { syncState as state } from '@/services/cloudSync';

function since(iso) {
  if (!iso) return '';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return ' · just now';
  if (minutes < 60) return ` · ${minutes} min ago`;
  return ` · ${new Date(iso).toLocaleString()}`;
}

// Most urgent first: a state the user must act on outranks routine progress.
const view = computed(() => {
  if (state.status === 'conflict') {
    return { kind: 'conflict', badge: '!', label: 'Google Drive: needs your choice — open Settings' };
  }
  if (!state.authorized) {
    return { kind: 'signed-out', badge: '×', label: 'Google Drive: signed out — open Settings to sign in' };
  }
  if (state.status === 'error') {
    return { kind: 'error', badge: '!', label: `Google Drive sync failed: ${state.error} — retrying` };
  }
  if (state.status === 'syncing') {
    return { kind: 'syncing', badge: '↻', label: 'Google Drive: syncing…' };
  }
  if (state.pending) {
    return { kind: 'pending', badge: '•', label: 'Google Drive: changes waiting to upload' };
  }
  return { kind: 'synced', badge: '✓', label: `Google Drive: synced${since(state.lastSyncedAt)}` };
});
</script>

<style scoped>
.sync-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border: 1.5px solid var(--border, #ddd);
  border-radius: 6px;
  background: var(--bg-surface, #fff);
  font-size: 1rem;
  line-height: 1;
  text-decoration: none;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.sync-indicator:hover {
  border-color: var(--border-focus, #667eea);
  background: var(--bg-surface-hover, #f5f5f5);
}

.badge {
  position: absolute;
  right: -5px;
  bottom: -5px;
  min-width: 14px;
  height: 14px;
  padding: 0 2px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
  color: #fff;
  background: var(--color-success, #22c55e);
  box-shadow: 0 0 0 1.5px var(--bg-header, #fff);
}

.is-pending .badge,
.is-conflict .badge {
  background: var(--color-warning, #f59e0b);
}

.is-syncing .badge {
  background: var(--color-info, #3b82f6);
  animation: sync-spin 1s linear infinite;
}

.is-error .badge {
  background: var(--color-danger, #ef4444);
}

.is-signed-out .cloud {
  opacity: 0.4;
}

.is-signed-out .badge {
  background: var(--text-muted, #888);
}

@keyframes sync-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-syncing .badge {
    animation: none;
  }
}
</style>
