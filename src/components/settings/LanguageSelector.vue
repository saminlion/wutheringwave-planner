<template>
  <div class="language-selector card">
    <div class="card-header">
      <span class="card-icon">🌐</span>
      <h3>{{ tUI('settings.language') }}</h3>
    </div>
    <div class="card-content">
      <div class="language-options">
        <button
          v-for="lang in supportedLocales"
          :key="lang.code"
          :class="['language-btn', { active: locale === lang.code }]"
          @click="changeLanguage(lang.code)"
        >
          {{ lang.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLocale } from '@/composables/useLocale';

const { locale, supportedLocales, setLocale, tUI } = useLocale();

const changeLanguage = async (langCode) => {
  await setLocale(langCode);
};
</script>

<style scoped>
.language-selector {
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

.language-options {
  display: flex;
  gap: 0.75rem;
}

.language-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.language-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
