import { ref, computed, triggerRef } from 'vue';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

// 현재 로케일 상태 (전역)
const currentLocale = ref(loadFromStorage('locale', 'en'));

// 현재 게임 ID (전역) - loadGameLocales 호출 시 업데이트
const currentGameId = ref(null);

// 번역 데이터 캐시 (UI 번역)
const baseTranslationsCache = ref({});

// 게임별 번역 데이터 캐시
const gameTranslationsCache = ref({});

// 지원 언어 목록
const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
];

// Vite의 import.meta.glob으로 로케일 파일 미리 로드
const localeModules = import.meta.glob('../locales/*.json');

// 게임별 로케일 파일 미리 로드
const gameLocaleModules = import.meta.glob('../games/*/locales/*.json');

/**
 * 기본 UI 번역 파일 로드
 * @param {string} locale - 언어 코드 (en, ko)
 */
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

/**
 * 게임별 번역 파일 로드
 * @param {string} gameId - 게임 ID (wutheringwave, endfield)
 * @param {string} locale - 언어 코드 (en, ko)
 */
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
    // 게임별 locale 파일이 없을 수 있음 (정상)
    return null;
  } catch (error) {
    console.warn(`Failed to load game translations for ${gameId}/${locale}`, error);
    return null;
  }
}

/**
 * 로케일 composable
 */
export function useLocale() {
  const locale = computed({
    get: () => currentLocale.value,
    set: (value) => {
      currentLocale.value = value;
      saveToStorage('locale', value);
    }
  });

  // 현재 번역 데이터 (base + game 머지)
  const currentTranslations = computed(() => {
    const base = baseTranslationsCache.value[currentLocale.value] || {};
    const gameId = currentGameId.value;
    if (!gameId) return base;

    const gameCacheKey = `${gameId}_${currentLocale.value}`;
    const game = gameTranslationsCache.value[gameCacheKey] || {};

    // 게임별 번역을 base에 머지 (characters, weapons, materials, ui)
    return {
      ...base,
      characters: { ...(base.characters || {}), ...(game.characters || {}) },
      weapons: { ...(base.weapons || {}), ...(game.weapons || {}) },
      materials: { ...(base.materials || {}), ...(game.materials || {}) },
      ui: { ...(base.ui || {}), ...(game.ui || {}) },
    };
  });

  /**
   * 번역 함수
   * @param {string|number} key - game_id 또는 UI key
   * @param {string} category - 카테고리 (characters, weapons, materials, ui)
   * @param {string} fallback - 번역 없을 때 기본값
   * @returns {string} 번역된 문자열
   */
  const t = (key, category = 'ui', fallback = null) => {
    const translations = currentTranslations.value;

    const categoryData = translations[category];
    if (!categoryData) {
      return fallback || String(key);
    }

    // game_id는 숫자일 수 있으므로 문자열로 변환
    const result = categoryData[String(key)];
    return result || fallback || String(key);
  };

  /**
   * 캐릭터 이름 번역
   * @param {number} gameId - 캐릭터 game_id
   * @param {string} fallback - 기본값 (영문 이름)
   */
  const tCharacter = (gameId, fallback = '') => {
    return t(gameId, 'characters', fallback);
  };

  /**
   * 무기 이름 번역
   * @param {number} gameId - 무기 game_id
   * @param {string} fallback - 기본값 (영문 이름)
   */
  const tWeapon = (gameId, fallback = '') => {
    return t(gameId, 'weapons', fallback);
  };

  /**
   * 재료 이름 번역
   * @param {number} gameId - 재료 game_id
   * @param {string} fallback - 기본값 (영문 이름)
   */
  const tMaterial = (gameId, fallback = '') => {
    return t(gameId, 'materials', fallback);
  };

  /**
   * UI 문자열 번역
   * @param {string} key - UI key (예: 'nav.planner')
   */
  const tUI = (key) => {
    return t(key, 'ui', key);
  };

  /**
   * 언어 변경
   * @param {string} newLocale - 새 언어 코드
   */
  const setLocale = async (newLocale) => {
    if (!supportedLocales.find(l => l.code === newLocale)) {
      console.warn(`Unsupported locale: ${newLocale}`);
      return false;
    }

    // 기본 UI 번역 로드
    await loadBaseTranslations(newLocale);

    // 현재 게임의 번역도 로드
    if (currentGameId.value) {
      await loadGameTranslationsFile(currentGameId.value, newLocale);
    }

    locale.value = newLocale;
    return true;
  };

  /**
   * 게임별 로케일 로드 (게임 변경 시 호출)
   * @param {string} gameId - 게임 ID
   */
  const loadGameLocales = async (gameId) => {
    currentGameId.value = gameId;

    // 현재 언어의 게임별 번역 로드
    await loadGameTranslationsFile(gameId, currentLocale.value);

    // fallback용 영어도 로드
    if (currentLocale.value !== 'en') {
      await loadGameTranslationsFile(gameId, 'en');
    }

    triggerRef(gameTranslationsCache);
  };

  /**
   * 초기화 - 번역 파일 로드
   */
  const initLocale = async () => {
    await loadBaseTranslations(currentLocale.value);
    // 영어도 fallback용으로 미리 로드
    if (currentLocale.value !== 'en') {
      await loadBaseTranslations('en');
    }
  };

  return {
    locale,
    supportedLocales,
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
