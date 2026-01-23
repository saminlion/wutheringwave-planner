import { ref, computed } from 'vue';
import { storage } from '@/utils/storage';

// 현재 로케일 상태 (전역)
const currentLocale = ref(storage.get('locale') || 'en');

// 번역 데이터 캐시
const translationsCache = ref({});

// 지원 언어 목록
const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
];

/**
 * 번역 파일 로드
 * @param {string} locale - 언어 코드 (en, ko)
 */
async function loadTranslations(locale) {
  if (translationsCache.value[locale]) {
    return translationsCache.value[locale];
  }

  try {
    // Dynamic import로 번역 파일 로드
    const translations = await import(`@/locales/${locale}.json`);
    translationsCache.value[locale] = translations.default;
    return translations.default;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);
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
      storage.set('locale', value);
    }
  });

  /**
   * 번역 함수
   * @param {string|number} key - game_id 또는 UI key
   * @param {string} category - 카테고리 (characters, weapons, materials, ui)
   * @param {string} fallback - 번역 없을 때 기본값
   * @returns {string} 번역된 문자열
   */
  const t = (key, category = 'ui', fallback = null) => {
    const translations = translationsCache.value[currentLocale.value];

    if (!translations) {
      return fallback || String(key);
    }

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

    await loadTranslations(newLocale);
    locale.value = newLocale;
    return true;
  };

  /**
   * 초기화 - 번역 파일 로드
   */
  const initLocale = async () => {
    await loadTranslations(currentLocale.value);
    // 영어도 fallback용으로 미리 로드
    if (currentLocale.value !== 'en') {
      await loadTranslations('en');
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
  };
}

export default useLocale;
