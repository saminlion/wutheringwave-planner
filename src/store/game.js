/**
 * Game Store
 * 현재 선택된 게임 상태 관리 (공통)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { getGame, getEnabledGames, DEFAULT_GAME_ID, supportedGames } from '@/games';

const STORAGE_KEY = 'current_game'; // storage.jsが自動でgameplanner_プレフィックスを追加

export const useGameStore = defineStore('game', () => {
  // State
  const currentGameId = ref(loadFromStorage(STORAGE_KEY, DEFAULT_GAME_ID));

  // Getters
  const currentGame = computed(() => getGame(currentGameId.value));
  const currentGameConfig = computed(() => currentGame.value?.config ?? null);
  const currentGameName = computed(() => {
    const game = supportedGames.find((g) => g.id === currentGameId.value);
    return game?.name ?? currentGameId.value;
  });
  const enabledGames = computed(() => getEnabledGames());

  // Filter options for UI (from game config)
  const filters = computed(() => currentGameConfig.value?.filters ?? null);

  // Form fields for dialogs (from game config)
  const formFields = computed(() => currentGameConfig.value?.formFields ?? null);

  // Actions
  /**
   * 게임 전환
   * @param {string} gameId - 전환할 게임 ID
   * @returns {boolean} 성공 여부
   */
  function switchGame(gameId) {
    const game = getGame(gameId);
    if (!game) {
      console.warn(`Game not found: ${gameId}`);
      return false;
    }

    currentGameId.value = gameId;
    saveToStorage(STORAGE_KEY, gameId);
    return true;
  }

  /**
   * 스토어 초기화 (앱 시작 시 호출)
   */
  function hydrate() {
    const savedGameId = loadFromStorage(STORAGE_KEY, DEFAULT_GAME_ID);

    // 저장된 게임이 유효한지 확인
    if (getGame(savedGameId)) {
      currentGameId.value = savedGameId;
    } else {
      currentGameId.value = DEFAULT_GAME_ID;
      saveToStorage(STORAGE_KEY, DEFAULT_GAME_ID);
    }
  }

  /**
   * 게임 데이터 조회 헬퍼
   * @param {string} type - 데이터 타입
   * @returns {object|null}
   */
  function getData(type) {
    const game = currentGame.value;
    if (!game) return null;

    if (typeof game.getData === 'function') {
      return game.getData(type);
    }

    if (type === 'characters') return game.data?.characters ?? null;
    if (type === 'weapons') return game.data?.weapons ?? null;
    if (type === 'materials') return game.materials?.database ?? null;
    if (type === 'costs') return game.costs ?? null;
    if (type === 'tiers') return game.materials?.tiers ?? null;

    return null;
  }

  /**
   * ゲーム専用コンポーネント取得ヘルパー
   * @param {string} name - コンポーネント名
   * @returns {Component|null}
   */
  function getComponent(name) {
    const game = currentGame.value;
    if (!game) return null;
    return game.components?.[name] ?? null;
  }

  return {
    // State
    currentGameId,

    // Getters
    currentGame,
    currentGameConfig,
    currentGameName,
    enabledGames,
    filters,
    formFields,

    // Actions
    switchGame,
    hydrate,
    getData,
    getComponent,
  };
});

export default useGameStore;
