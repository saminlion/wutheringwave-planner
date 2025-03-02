import inventoryItem from '../data/inventoryItem.json';

/**
 * Finds material by type and identifier (subCategory or nameKey).
 *
 * @param {string} type - The type of material (e.g., "common", "ascension", "boss").
 * @param {string} identifier - SubCategory (for common) or nameKey (for others).
 * @param {number|null} rarity - The rarity of the material (optional).
 * @param {boolean} useNameKey - Whether to use nameKey for matching.
 * @returns {Object|null} - The matched material data or null if not found.
 */
export const findMaterial = (type, identifier, rarity = null, useNameKey = false) => {
  if (!inventoryItem[type]) {
    console.warn(`Material type "${type}" not found in inventory.`);
    return null;
  }

  if (useNameKey) {
    const materialData = inventoryItem[type]?.[identifier];
    if (!materialData) {
      console.warn(`Material with nameKey "${identifier}" not found in type "${type}".`);
      return null;
    }
    return materialData;
  } else {
    const matchedItem = Object.values(inventoryItem[type]).find(
      (item) => item.SubCategory === identifier && (!rarity || item.rarity === rarity)
    );
    if (!matchedItem) {
      console.warn(`Material with SubCategory "${identifier}" not found in type "${type}".`);
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
    console.warn(`Field "${field}" not found in material.`);
    return null;
  }
  return material[field];
};