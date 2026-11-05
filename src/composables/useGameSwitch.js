import { useGameStore } from '@/store/game';
import { usePlannerStore } from '@/store/planner';
import { useInventoryStore } from '@/store/inventory';
import { useUserProfileStore } from '@/store/userProfile';
import { useLocale } from '@/composables/useLocale';
import logger from '@/utils/logger';

/**
 * Switch the current game and reload everything that is stored per game.
 * Shared by the header game tabs and the Settings game visibility list
 * (which has to move off a game the user just hid).
 */
export function useGameSwitch() {
  const gameStore = useGameStore();
  const plannerStore = usePlannerStore();
  const inventoryStore = useInventoryStore();
  const userProfileStore = useUserProfileStore();
  const { loadGameLocales } = useLocale();

  /** @returns {Promise<boolean>} true when the game actually changed */
  const switchTo = async (gameId) => {
    if (gameId === gameStore.currentGameId) return false;
    if (!gameStore.switchGame(gameId)) return false;

    plannerStore.hydrate(gameId);
    inventoryStore.hydrate(gameId);
    userProfileStore.hydrate(gameId);
    await loadGameLocales(gameId);

    logger.info(`Game switched to: ${gameId}`);
    return true;
  };

  return { switchTo };
}

export default useGameSwitch;
