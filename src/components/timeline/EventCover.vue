<template>
  <div class="event-cover" :style="fallbackStyle">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      loading="lazy"
      @error="failed = true"
    />
    <span v-else class="cover-initial">{{ initial }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  color: { type: String, default: '#667eea' },
});

// A broken image URL must never blank the card — fall back to the color tile.
const failed = ref(false);
watch(() => props.src, () => { failed.value = false; });

const initial = computed(() => (props.alt || '?').trim().charAt(0).toUpperCase());

const fallbackStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.color}, color-mix(in srgb, ${props.color} 55%, #000))`,
}));
</script>

<style scoped>
.event-cover {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-initial {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  user-select: none;
}
</style>
