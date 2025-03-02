import inventoryItem from '../data/inventoryItem.json';

/**
 * Finds material by type and identifier (game_id or SubCategory).
 *
 * @param {string} type - The type of material (e.g., "common", "ascension", "boss").
 * @param {string|number} identifier - The game_id (id) or SubCategory of the material.
 * @param {number|null} rarity - The rarity of the material (optional).
 * @param {boolean} useId - Whether to use game_id for matching.
 * @returns {Object|null} - The matched material data or null if not found.
 */
export const findMaterial = (type, identifier, rarity = null, useId = false) => {
    if (!inventoryItem[type]) {
      console.warn(`Material type "${type}" not found in inventory.`);
      return null;
    }
  
    if (useId) {
      // game_id 기반 검색
      console.log(`Searching by game_id: ${identifier}`);
      //console.log(`Searching in type "${type}":`, JSON.stringify(inventoryItem[type], null, 2));
      const materialData = Object.values(inventoryItem[type]).find(
        (item) => String(item.game_id) === String(identifier) // 문자열 비교
    );
      if (!materialData) {
        console.warn(`Material with game_id "${identifier}" not found in type "${type}".`);
        return null;
      }
      return materialData;
    } else {
      // SubCategory 기반 검색
      console.log(`Searching by SubCategory: ${identifier}, Rarity: ${rarity}`);
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

/**
 * Processes a material based on its key and adds the required quantity to the materials object.
 *
 * @param {Object} materials - The object to store calculated materials.
 * @param {string} key - The type of material (e.g., "common", "ascension").
 * @param {any} value - The value associated with the key (e.g., [qty, tier] for common).
 * @param {Object} characterInfo - The character's specific data (e.g., common type, ascension key).
 */
export const processMaterials = (materials, key, value, characterInfo) => {
    if (!materials.processed) materials.processed = new Set();
    const materialKey = `${key}-${JSON.stringify(value)}`;
    console.log(`[Debug] processMaterials Material key: ${key}`);

    if (materials.processed.has(materialKey)) {
      console.log(`Skipping duplicate material: ${materialKey}`);
      return;
    }
    materials.processed.add(materialKey);
  
    // 기존 로직 유지
    if (['common', 'forgery'].includes(key)) {
      const [qty, tier] = value;
      const materialSource = key === 'forgery' ? characterInfo.forgery : characterInfo.common; // forgery와 common 분리

      console.log(`CharacterInfo: ${characterInfo} / Forgery: ${characterInfo.forgery} / Common: ${characterInfo.common}`);

      console.log(`[Debug] processMaterials Material Source: ${materialSource}, Tier: ${tier}`);
      const material = findMaterial(key, materialSource, tier);
      if (material) {
        const materialKey = getMaterialField(material, 'game_id');
        if (materialKey) {
          materials[materialKey] = (materials[materialKey] || 0) + qty;
        }
      }
    } else if (['ascension', 'boss', 'weeklyBoss', 'credit'].includes(key)) {
      let gameId = characterInfo[key];
      
      if (key == 'credit')
      {
        gameId = 2;
      }

      console.log(`[Debug] processMaterials Material Source: ${gameId}, key: ${key}`);

      const material = findMaterial(key, gameId, null, true);
      if (material) {
        const materialKey = getMaterialField(material, 'game_id');
        if (materialKey) {
          materials[materialKey] = (materials[materialKey] || 0) + value;
        }
      }
    } else if (key !== 'level') {
      materials[key] = (materials[key] || 0) + value;
    }
  };