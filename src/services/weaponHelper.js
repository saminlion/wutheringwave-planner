import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

/**
 * 現在のゲームの武器データを取得
 * @returns {Object} 武器データ
 */
const getWeaponRaw = () => {
  const gameStore = useGameStore();
  const weapons = gameStore.getData('weapons');
  logger.debug('getWeaponRaw - currentGameId:', gameStore.currentGameId);
  logger.debug('getWeaponRaw - weapons count:', Object.keys(weapons || {}).length);
  return weapons || {};
};

/**
 * Retrieves a field value from the weapon data based on the weapon ID.
 *
 * @param {string|number} id - The weapon ID.
 * @param {string|null} field - The specific field to retrieve (optional).
 * @returns {string|Object|null} The field value, full weapon data, or null if not found.
 */
export const getWeaponField = (id, field = null) => {
  const weaponRaw = getWeaponRaw();
  const weaponData = Object.values(weaponRaw).find(
    (item) => String(item.game_id) === String(id)
  );

  if (!weaponData) {
    logger.warn(`Weapon with ID "${id}" not found in weaponRaw.`);
    return null;
  }

  if (!field) {
    return weaponData;
  }

  return weaponData[field] ?? null;
};
