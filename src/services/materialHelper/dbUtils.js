import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

/**
 * 現在のゲームのマテリアルデータを取得
 */
const getInventoryItem = () => {
  const gameStore = useGameStore();
  return gameStore.getData('materials') || {};
};

/**
 * Finds material by type and identifier (game_id or SubCategory).
 *
 * @param {string} type - The type of material (e.g., "common", "ascension", "boss").
 * @param {string|number} identifier - The game_id (id) or SubCategory of the material.
 * @param {number|null} tier - The tier of the material (optional, used for tiered materials like common/forgery).
 * @param {boolean} useId - Whether to use game_id for matching.
 * @returns {Object|null} - The matched material data or null if not found.
 */
export const findMaterial = (type, identifier, tier = null, useId = false) => {
    const inventoryItem = getInventoryItem();
    if (!inventoryItem[type]) {
        logger.warn(`Material type "${type}" not found in inventory.`);
        return null;
    }

    if (useId) {
        const materialData = Object.values(inventoryItem[type]).find(
            (item) => String(item.game_id) === String(identifier)
        );
        if (!materialData) {
            logger.warn(`Material with game_id "${identifier}" not found in type "${type}".`);
            return null;
        }
        return materialData;
    } else {
        const matchedItem = Object.values(inventoryItem[type]).find(
            (item) => item.SubCategory === identifier && (!tier || item.tier === tier)
        );
        if (!matchedItem) {
            logger.warn(`Material with SubCategory "${identifier}" and tier "${tier}" not found in type "${type}".`);
            return null;
        }
        return matchedItem;
    }
};

/**
 * Extracts specific data (e.g., icon, label, id) from material.
 *
 * @param {Object} material - The material object.
 * @param {string} field - The field to extract (e.g., "icon", "label", "game_id").
 * @returns {string|null} - The value of the specified field or null if not found.
 */
export const getMaterialField = (material, field) => {
    if (!material || !material[field]) {
        logger.warn(`Field "${field}" not found in material.`);
        return null;
    }
    return material[field];
};

/**
 * Extracts specific data (e.g., icon, label, id) from material.
 *
 * @param {Object} material - The material object.
 * @param {string} field - The field to extract (e.g., "icon", "label", "game_id").
 * @returns {string|null} - The value of the specified field or null if not found.
 */
export const getMaterialFieldById = (id, field) => {
    const inventoryItem = getInventoryItem();
    const materialData = Object.values(inventoryItem).flatMap((category) => Object.values(category)).find(
        (item) => String(item.game_id) === String(id)
    );

    if (!materialData) {
        logger.debug(`Material with ID "${id}" not found in inventoryItem.`);
        return null;
    }

    if (field) {
        if (materialData[field] == null) {
            logger.debug(`Field "${field}" not found in materialData for ID "${id}".`);
            return null;
        }
        return materialData[field];
    }

    logger.debug('Retrieved entire material data for ID:', id, materialData);
    return materialData;
};

export const findAllUniqueSubCategories = (inventoryItemParam, shortages) => {
    // Flatten inventoryItem to a single array of all items
    const allItems = Object.values(inventoryItem).flatMap((category) => Object.values(category));

    // Filter items where game_id matches any key in shortages
    const matchedItems = allItems.filter((item) =>
        shortages.hasOwnProperty(String(item.game_id)) // Match game_id with shortages keys
    );

    // Extract SubCategories and remove duplicates using Set
    const uniqueSubCategories = [...new Set(matchedItems.map((item) => item.SubCategory))];

    return uniqueSubCategories;
};
