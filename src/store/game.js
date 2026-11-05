/**
 * Game Store
 * 현재 선택된 게임 상태 관리 (공통)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { getGame, getEnabledGames, DEFAULT_GAME_ID, supportedGames } from '@/games';

const STORAGE_KEY = 'current_game'; // storage.jsが自動でgameplanner_プレフィックスを追加
// Games the user hid from the game tabs. A user preference, so it is cloud-synced.
const HIDDEN_KEY = 'hidden_games';

export const useGameStore = defineStore('game', () => {
  // State
  const hiddenGameIds = ref(loadFromStorage(HIDDEN_KEY, []));

  /** Enabled games minus the hidden ones — never empty, even if storage says all are hidden. */
  const visibleGames = computed(() => {
    const visible = getEnabledGames().filter((g) => !hiddenGameIds.value.includes(g.id));
    return visible.length ? visible : getEnabledGames();
  });

  /** The saved game if it is still shown, otherwise the first shown one. */
  function resolveGameId(gameId) {
    if (getGame(gameId) && visibleGames.value.some((g) => g.id === gameId)) return gameId;
    return visibleGames.value[0]?.id ?? DEFAULT_GAME_ID;
  }

  const currentGameId = ref(resolveGameId(loadFromStorage(STORAGE_KEY, DEFAULT_GAME_ID)));

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
    hiddenGameIds.value = loadFromStorage(HIDDEN_KEY, []);
    const savedGameId = loadFromStorage(STORAGE_KEY, DEFAULT_GAME_ID);

    // 저장된 게임이 유효하고 숨겨지지 않았는지 확인
    currentGameId.value = resolveGameId(savedGameId);
    if (currentGameId.value !== savedGameId) saveToStorage(STORAGE_KEY, currentGameId.value);
  }

  /**
   * Show or hide a game in the game tabs. Data of a hidden game is kept.
   * Switching away from a hidden current game is the caller's job
   * (useGameSwitch), since it also reloads the other stores.
   * @returns {boolean} false when it would hide the last visible game
   */
  function setGameHidden(gameId, hidden) {
    const next = new Set(hiddenGameIds.value);
    if (hidden) next.add(gameId);
    else next.delete(gameId);

    if (getEnabledGames().every((g) => next.has(g.id))) return false;

    hiddenGameIds.value = [...next];
    saveToStorage(HIDDEN_KEY, hiddenGameIds.value);
    return true;
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
    hiddenGameIds,

    // Getters
    currentGame,
    currentGameConfig,
    currentGameName,
    enabledGames,
    visibleGames,
    filters,
    formFields,

    // Actions
    switchGame,
    setGameHidden,
    hydrate,
    getData,
    getComponent,
  };
});

export default useGameStore;
