/**
 * User Profile Store
 * 사용자 진행도 설정 관리 (공통)
 * - 던전 레벨 설정
 * - 스테미너 계산 연동
 * - 파밍 일정 계산
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { useGameStore } from './game';

/**
 * 게임별 기본 던전 레벨 설정
 */
const DEFAULT_DUNGEON_LEVELS = {
  wutheringwave: {
    player_exp: 6,
    weapon_exp: 6,
    credit: 6,
    forgery: 6,
  },
  endfield: {
    player_exp: 5,
    weapon_exp: 5,
    credit: 5,
    forgery_skill: 5,
    forgery_ascension: 5,
  },
};

/**
 * 게임별 던전 정보 (레벨별 드랍량, 이성 소모)
 * TODO: 실제 데이터로 업데이트 필요
 */
const DUNGEON_DATA = {
  wutheringwave: {
    player_exp: {
      name: '각성 시뮬레이션',
      levels: {
        1: { stamina: 20, drops: { total_exp: 10000 } },
        2: { stamina: 30, drops: { total_exp: 20000 } },
        3: { stamina: 40, drops: { total_exp: 35000 } },
        4: { stamina: 40, drops: { total_exp: 50000 } },
        5: { stamina: 40, drops: { total_exp: 64000 } },
        6: { stamina: 40, drops: { total_exp: 76000 } },
      },
    },
    weapon_exp: {
      name: '무기 경험치 던전',
      levels: {
        1: { stamina: 20, drops: { total_exp: 10000 } },
        2: { stamina: 30, drops: { total_exp: 20000 } },
        3: { stamina: 40, drops: { total_exp: 35000 } },
        4: { stamina: 40, drops: { total_exp: 50000 } },
        5: { stamina: 40, drops: { total_exp: 64000 } },
        6: { stamina: 40, drops: { total_exp: 76000 } },
      },
    },
    credit: {
      name: '은파 저장고',
      levels: {
        1: { stamina: 20, drops: { credit: 14000 } },
        2: { stamina: 30, drops: { credit: 28000 } },
        3: { stamina: 40, drops: { credit: 49000 } },
        4: { stamina: 40, drops: { credit: 60000 } },
        5: { stamina: 40, drops: { credit: 72000 } },
        6: { stamina: 40, drops: { credit: 84000 } },
      },
    },
    forgery: {
      name: '포지리 챌린지',
      levels: {
        1: { stamina: 20, drops: { tier3: 6, tier2: 8, tier1: 12 } },
        2: { stamina: 30, drops: { tier3: 12, tier2: 16, tier1: 18 } },
        3: { stamina: 40, drops: { tier4: 2, tier3: 18, tier2: 20, tier1: 24 } },
        4: { stamina: 40, drops: { tier4: 4, tier3: 21, tier2: 22, tier1: 26 } },
        5: { stamina: 40, drops: { tier4: 6, tier3: 24, tier2: 24, tier1: 28 } },
        6: { stamina: 40, drops: { tier4: 9, tier3: 27, tier2: 26, tier1: 30 } },
      },
    },
  },
  endfield: {
    player_exp: {
      name: '경험치 던전',
      levels: {
        1: { stamina: 40, drops: { tier4: 4, tier3: 2, tier2: 3 } },
        2: { stamina: 50, drops: { tier4: 6, tier3: 9, tier2: 4 } },
        3: { stamina: 60, drops: { tier4: 9, tier3: 9, tier2: 4 } },
        4: { stamina: 70, drops: { tier4: 13, tier3: 7, tier2: 2 } },
        5: { stamina: 80, drops: { tier4: 17 } },
      },
    },
    weapon_exp: {
      name: '무기 경험치 던전',
      levels: {
        1: { stamina: 40, drops: { tier4: 4, tier3: 6, tier2: 7 } },
        2: { stamina: 50, drops: { tier4: 6, tier3: 9, tier2: 4 } },
        3: { stamina: 60, drops: { tier4: 9, tier3: 9, tier2: 1 } },
        4: { stamina: 70, drops: { tier4: 12, tier3: 16, tier2: 7 } },
        5: { stamina: 80, drops: { tier4: 16, tier3: 10 } },
      },
    },
    credit: {
      name: '화폐 던전',
      levels: {
        1: { stamina: 40, drops: { credit: 8500 } },
        2: { stamina: 50, drops: { credit: 13500 } },
        3: { stamina: 60, drops: { credit: 19500 } },
        4: { stamina: 70, drops: { credit: 27500 } },
        5: { stamina: 80, drops: { credit: 34000 } },
      },
    },
    forgery_skill: {
      name: '스킬 재료 던전',
      levels: {
        1: { stamina: 40, drops: { tier3: 21 } },
        2: { stamina: 50, drops: { tier3: 35 } },
        3: { stamina: 60, drops: { tier4: 10, tier3: 50 } },
        4: { stamina: 70, drops: { tier4: 14, tier3: 69 } },
        5: { stamina: 80, drops: { tier4: 17, tier3: 85 } },
      },
    },
    forgery_ascension: {
      name: '돌파 재료 던전',
      levels: {
        1: { stamina: 40, drops: { tier3: 20 } },
        2: { stamina: 50, drops: { tier3: 35 } },
        3: { stamina: 60, drops: { tier4: 10, tier3: 50 } },
        4: { stamina: 70, drops: { tier4: 14, tier3: 69 } },
        5: { stamina: 80, drops: { tier4: 17, tier3: 85 } },
      },
    },
  },
};

export const useUserProfileStore = defineStore('userProfile', () => {
  const gameStore = useGameStore();

  // State: 게임별 던전 레벨 설정
  const profiles = ref({});

  // Getters
  /**
   * 현재 게임의 프로필
   */
  const currentProfile = computed(() => {
    const gameId = gameStore.currentGameId;
    if (!profiles.value[gameId]) {
      profiles.value[gameId] = {
        dungeonLevels: { ...DEFAULT_DUNGEON_LEVELS[gameId] },
      };
    }
    return profiles.value[gameId];
  });

  /**
   * 현재 게임의 던전 레벨 설정
   */
  const dungeonLevels = computed(() => currentProfile.value?.dungeonLevels ?? {});

  /**
   * 현재 게임의 던전 정보
   */
  const dungeonData = computed(() => DUNGEON_DATA[gameStore.currentGameId] ?? {});

  /**
   * 던전 카테고리 목록
   */
  const dungeonCategories = computed(() => {
    const data = dungeonData.value;
    return Object.keys(data).map((key) => ({
      id: key,
      name: data[key].name,
      maxLevel: Object.keys(data[key].levels).length,
      currentLevel: dungeonLevels.value[key] ?? 1,
    }));
  });

  // Actions
  /**
   * 던전 레벨 설정
   * @param {string} dungeonKey - 던전 카테고리 키
   * @param {number} level - 레벨
   */
  function setDungeonLevel(dungeonKey, level) {
    const gameId = gameStore.currentGameId;
    if (!profiles.value[gameId]) {
      profiles.value[gameId] = {
        dungeonLevels: { ...DEFAULT_DUNGEON_LEVELS[gameId] },
      };
    }
    profiles.value[gameId].dungeonLevels[dungeonKey] = level;
    _saveProfile(gameId);
  }

  /**
   * 던전 드랍 정보 조회
   * @param {string} dungeonKey - 던전 카테고리 키
   * @returns {object|null} 드랍 정보
   */
  function getDungeonDrops(dungeonKey) {
    const gameId = gameStore.currentGameId;
    const level = dungeonLevels.value[dungeonKey] ?? 1;
    return DUNGEON_DATA[gameId]?.[dungeonKey]?.levels?.[level] ?? null;
  }

  /**
   * 스테미너 비용 계산
   * @param {string} dungeonKey - 던전 카테고리 키
   * @param {number} targetAmount - 필요량
   * @returns {object} { runs, stamina, days }
   */
  function calculateStaminaCost(dungeonKey, targetAmount) {
    const drops = getDungeonDrops(dungeonKey);
    if (!drops) return { runs: 0, stamina: 0, days: 0 };

    const gameConfig = gameStore.currentGameConfig;
    const dailyStamina = gameConfig?.stamina?.dailyLimit ?? 240;

    // 드랍량 계산 (total 또는 개별 합산)
    let dropsPerRun = 0;
    if (drops.drops.total_exp) {
      dropsPerRun = drops.drops.total_exp;
    } else if (drops.drops.credit) {
      dropsPerRun = drops.drops.credit;
    } else {
      // tier4, tier3, tier2, tier1 등 합산
      dropsPerRun = Object.values(drops.drops).reduce((sum, v) => sum + v, 0);
    }

    const runs = dropsPerRun > 0 ? Math.ceil(targetAmount / dropsPerRun) : 0;
    const stamina = runs * drops.stamina;
    const days = dailyStamina > 0 ? Math.ceil(stamina / dailyStamina) : 0;

    return { runs, stamina, days };
  }

  /**
   * 스토어 초기화
   * @param {string} gameId - 게임 ID (optional, 현재 게임 사용)
   */
  function hydrate(gameId = null) {
    const targetGameId = gameId ?? gameStore.currentGameId;
    const storageKey = `wwplanner_profile_${targetGameId}`;
    const saved = loadFromStorage(storageKey, null);

    if (saved) {
      profiles.value[targetGameId] = saved;
    } else {
      profiles.value[targetGameId] = {
        dungeonLevels: { ...DEFAULT_DUNGEON_LEVELS[targetGameId] },
      };
    }
  }

  /**
   * 프로필 저장 (내부용)
   * @param {string} gameId
   */
  function _saveProfile(gameId) {
    const storageKey = `wwplanner_profile_${gameId}`;
    saveToStorage(storageKey, profiles.value[gameId]);
  }

  return {
    // State
    profiles,

    // Getters
    currentProfile,
    dungeonLevels,
    dungeonData,
    dungeonCategories,

    // Actions
    setDungeonLevel,
    getDungeonDrops,
    calculateStaminaCost,
    hydrate,
  };
});

export default useUserProfileStore;
