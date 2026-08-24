<template>
    <Teleport to="body">
        <div v-if="visible" class="confirm-overlay" @click.self="cancel">
            <div class="confirm-content" role="alertdialog" aria-modal="true" :aria-label="options.title || options.message">
                <h3 v-if="options.title" class="confirm-title">{{ options.title }}</h3>
                <p class="confirm-message">{{ options.message }}</p>
                <div class="confirm-actions">
                    <button class="confirm-btn cancel" @click="cancel">{{ options.cancelText }}</button>
                    <button ref="acceptBtn" class="confirm-btn accept" :class="{ danger: options.danger }"
                        @click="accept">{{ options.confirmText }}</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useConfirm } from '@/composables/useConfirm';

const { visible, options, accept, cancel } = useConfirm();

const acceptBtn = ref(null);

watch(visible, async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    acceptBtn.value?.focus();
});

const onKeydown = (e) => {
    if (!visible.value) return;
    if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        accept();
    }
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    /* 他のダイアログ（z-index: 1000）より上に出す */
    z-index: 2000;
    padding: 16px;
}

.confirm-content {
    background: var(--bg-surface, #fff);
    color: var(--text, #2c3e50);
    border: 1px solid var(--border, #ddd);
    border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
    min-width: 320px;
    max-width: min(520px, 90vw);
    max-height: 80vh;
    overflow-y: auto;
    padding: 24px;
    text-align: left;
}

.confirm-title {
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 700;
}

.confirm-message {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    /* 呼び出し側が \n で組み立てたメッセージをそのまま表示する */
    white-space: pre-line;
    word-break: break-word;
}

.confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
}

.confirm-btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: 1.5px solid var(--border, #ddd);
    background: var(--bg-surface, #fff);
    color: var(--text, #2c3e50);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.confirm-btn:hover {
    background: var(--bg-surface-hover, #f5f5f5);
}

.confirm-btn.accept {
    background: var(--link, #42b983);
    border-color: var(--link, #42b983);
    color: #fff;
    font-weight: 600;
}

.confirm-btn.accept:hover {
    opacity: 0.85;
    background: var(--link, #42b983);
}

.confirm-btn.accept.danger {
    background: #e74c3c;
    border-color: #e74c3c;
}

.confirm-btn.accept.danger:hover {
    background: #e74c3c;
}
</style>
