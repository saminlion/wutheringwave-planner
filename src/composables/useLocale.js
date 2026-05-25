import { ref, computed, triggerRef } from 'vue';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

const currentLocale = ref(loadFromStorage('locale', 'en'));
const currentGameId = ref(null);
const baseTranslationsCache = ref({});
const gameTranslationsCache = ref({});

const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
];

const localeModules = import.meta.glob('../locales/*.json');
const gameLocaleModules = import.meta.glob('../games/*/locales/*.json');

async function loadBaseTranslations(locale) {
  if (baseTranslationsCache.value[locale]) {
    return baseTranslationsCache.value[locale];
  }

  try {
    const modulePath = `../locales/${locale}.json`;
    if (localeModules[modulePath]) {
      const module = await localeModules[modulePath]();
      baseTranslationsCache.value[locale] = module.default;
      triggerRef(baseTranslationsCache);
      return module.default;
    }
    console.warn(`Locale file not found: ${locale}`);
    return null;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);
    return null;
  }
}

async function loadGameTranslationsFile(gameId, locale) {
  const cacheKey = `${gameId}_${locale}`;
  if (gameTranslationsCache.value[cacheKey]) {
    return gameTranslationsCache.value[cacheKey];
  }

  try {
    const modulePath = `../games/${gameId}/locales/${locale}.json`;
    if (gameLocaleModules[modulePath]) {
      const module = await gameLocaleModules[modulePath]();
      gameTranslationsCache.value[cacheKey] = module.default;
      triggerRef(gameTranslationsCache);
      return module.default;
    }
    return null;
  } catch (error) {
    console.warn(`Failed to load game translations for ${gameId}/${locale}`, error);
    return null;
  }
}

export function useLocale() {
  const locale = computed({
    get: () => currentLocale.value,
    set: (value) => {
      currentLocale.value = value;
      saveToStorage('locale', value);
    }
  });

  // 현재 번역 (base + 모든 게임 ui 병합 + 현재 게임 전체)
  const currentTranslations = computed(() => {
    const base = baseTranslationsCache.value[currentLocale.value] || {};
    const gameId = currentGameId.value;
    const gameCacheKey = gameId ? `${gameId}_${currentLocale.value}` : null;
    const game = gameCacheKey ? (gameTranslationsCache.value[gameCacheKey] || {}) : {};

    // 모든 게임의 ui 섹션 병합 (game.name.*, game.icon.* 등이 어느 게임 선택 중에도 표시되도록)
    const allGameUi = {};
    for (const [cacheKey, gameData] of Object.entries(gameTranslationsCache.value)) {
      if (cacheKey.endsWith(`_${currentLocale.value}`)) {
        Object.assign(allGameUi, gameData.ui || {});
      }
    }

    return {
      ...base,
      characters: { ...(base.characters || {}), ...(game.characters || {}) },
      weapons: { ...(base.weapons || {}), ...(game.weapons || {}) },
      materials: { ...(base.materials || {}), ...(game.materials || {}) },
      // 현재 게임 ui가 allGameUi를 덮어쓰도록 순서 유지
      ui: { ...(base.ui || {}), ...allGameUi, ...(game.ui || {}) },
      guide: game.guide || null,
    };
  });

  const t = (key, category = 'ui', fallback = null) => {
    const translations = currentTranslations.value;
    const categoryData = translations[category];
    if (!categoryData) return fallback || String(key);
    const result = categoryData[String(key)];
    return result || fallback || String(key);
  };

  const tCharacter = (gameId, fallback = '') => t(gameId, 'characters', fallback);
  const tWeapon = (gameId, fallback = '') => t(gameId, 'weapons', fallback);
  const tMaterial = (gameId, fallback = '') => t(gameId, 'materials', fallback);
  const tUI = (key) => t(key, 'ui', key);

  const setLocale = async (newLocale) => {
    if (!supportedLocales.find(l => l.code === newLocale)) {
      console.warn(`Unsupported locale: ${newLocale}`);
      return false;
    }
    await loadBaseTranslations(newLocale);
    if (currentGameId.value) {
      await loadGameTranslationsFile(currentGameId.value, newLocale);
    }
    locale.value = newLocale;
    return true;
  };

  const loadGameLocales = async (gameId) => {
    currentGameId.value = gameId;
    await loadGameTranslationsFile(gameId, currentLocale.value);
    if (currentLocale.value !== 'en') {
      await loadGameTranslationsFile(gameId, 'en');
    }
    triggerRef(gameTranslationsCache);
  };

  /**
   * 초기화 - base 번역 로드, 필요 시 모든 게임 locale preload
   * @param {string[]} gameIds - preload할 게임 ID 목록 (game.name.* 등 헤더에서 필요)
   */
  const initLocale = async (gameIds = []) => {
    await loadBaseTranslations(currentLocale.value);
    if (currentLocale.value !== 'en') {
      await loadBaseTranslations('en');
    }

    // 모든 게임 ui locale preload (GameSelector에서 모든 게임 이름 표시 위해)
    for (const gid of gameIds) {
      await loadGameTranslationsFile(gid, currentLocale.value);
      if (currentLocale.value !== 'en') {
        await loadGameTranslationsFile(gid, 'en');
      }
    }
  };

  return {
    locale,
    supportedLocales,
    currentTranslations,
    t,
    tCharacter,
    tWeapon,
    tMaterial,
    tUI,
    setLocale,
    initLocale,
    loadGameLocales,
  };
}

export default useLocale;
