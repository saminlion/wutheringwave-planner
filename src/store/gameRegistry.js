/**
 * Game Registry Store
 * Manages multiple game configurations and switching between games
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import logger from '@/utils/logger';

export const useGameRegistryStore = defineStore('gameRegistry', () => {
  // Registered games
  const games = ref({});

  // Currently active game ID
  const currentGameId = ref('wutheringwave'); // Default to WW

  /**
   * Register a game plugin
   * @param {Object} gamePlugin - Game plugin object with id, name, config, data
   */
  const registerGame = (gamePlugin) => {
    if (!gamePlugin.id) {
      logger.error('Game plugin must have an id');
      return false;
    }

    games.value[gamePlugin.id] = gamePlugin;
    logger.info(`Registered game: ${gamePlugin.name || gamePlugin.id}`);
    return true;
  };

  /**
   * Set the current active game
   * @param {string} gameId - Game ID to switch to
   */
  const setCurrentGame = (gameId) => {
    if (!games.value[gameId]) {
      logger.error(`Game not found: ${gameId}`);
      return false;
    }

    currentGameId.value = gameId;
    logger.info(`Switched to game: ${gameId}`);

    // Save to localStorage
    localStorage.setItem('wwplanner_current_game', gameId);
    return true;
  };

  /**
   * Get the current active game
   */
  const currentGame = computed(() => {
    return games.value[currentGameId.value] || null;
  });

  /**
   * Get all registered games
   */
  const allGames = computed(() => {
    return Object.values(games.value);
  });

  /**
   * Get a specific game by ID
   * @param {string} gameId
   */
  const getGame = (gameId) => {
    return games.value[gameId] || null;
  };

  /**
   * Initialize registry from localStorage
   */
  const hydrate = () => {
    const savedGameId = localStorage.getItem('wwplanner_current_game');
    if (savedGameId && games.value[savedGameId]) {
      currentGameId.value = savedGameId;
      logger.info(`Restored game: ${savedGameId}`);
    }
  };

  return {
    // State
    games,
    currentGameId,

    // Computed
    currentGame,
    allGames,

    // Actions
    registerGame,
    setCurrentGame,
    getGame,
    hydrate,
  };
});
