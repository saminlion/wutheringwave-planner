<template>
    <!-- Sits in a growth dialog's header next to the close button. The dialog owns what "max" means
         (its own level list / skill ranges); this is only the shared look. -->
    <button type="button" class="max-btn" :title="tUI('common.maxAllHint')" @click="$emit('click')">
        MAX
    </button>
</template>

<script setup>
import { useLocale } from '@/composables/useLocale';

defineEmits(['click']);
const { tUI } = useLocale();
</script>

<style scoped>
.max-btn {
    height: 32px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    background: var(--accent-color, #4a90e2);
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.8px;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.15s;
}

.max-btn:hover {
    opacity: 0.85;
}
</style>
