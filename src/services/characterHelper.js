import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

/**
 * 現在のゲームのキャラクターデータを取得
 * @returns {Object} キャラクターデータ
 */
const getCharacterRaw = () => {
  const gameStore = useGameStore();
  return gameStore.getData('characters') || {};
};

/**
 * Extracts specific data (e.g., icon, label, id) from character.
 *
 * @param {Object} id - The character ID.
 * @param {string} field - The field to extract (e.g., "icon", "label", "game_id").
 * @returns {string|Object|null} - The value of the specified field, the entire character object if no field is provided, or null if not found.
 */
export const getCharacterField = (id, field = null) => {
    const characterRaw = getCharacterRaw();
    const characterData = Object.values(characterRaw).find(
      (item) => String(item.game_id) === String(id)
    );

    if (!characterData) {
      logger.warn(`Character with ID "${id}" not found in characterRaw.`);
      return null;
    }

    if (field) {
      if (characterData[field] == null) {
        logger.warn(`Field "${field}" not found in characterData for ID "${id}".`);
        return null;
      }
      logger.debug(`Retrieved field "${field}":`, characterData[field]);
      return characterData[field];
    }

    logger.debug('Retrieved entire character data for ID:', id, characterData);
    return characterData;
  };
