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

/**
 * Calculates the required player_exp materials.
 *
 * @param {number} expNeeded - The total experience required.
 * @param {Object} expMaterialTypeStructure - Experience material definitions.
 * @param {Object} ownedMaterials - User's current inventory of experience materials.
 * @returns {Object} - Required materials for player_exp.
 */
export const calculatePlayerExp = (expNeeded, expMaterialTypeStructure, ownedMaterials) => {
    const result = {};
    let remainingExp = expNeeded;
  
    // Sort experience materials by exp_value in descending order
    const sortedExpMaterials = Object.entries(expMaterialTypeStructure).sort(
      ([, a], [, b]) => b.exp_value - a.exp_value
    );
  
    for (const [materialId, { exp_value }] of sortedExpMaterials) {
      const neededCount = Math.ceil(remainingExp / exp_value); // Calculate required count
      const ownedCount = ownedMaterials[materialId]?.count || 0; // Get owned count

      console.log('ownedCount',ownedCount);

      const usedCount = Math.min(neededCount, ownedCount || neededCount); // Use ownedCount if available, else use neededCount
  
      remainingExp -= usedCount * exp_value;
  
      result[materialId] = {
        needed: usedCount,
        owned: ownedCount,
        remainingExp: Math.max(remainingExp, 0), // Ensure no negative remainingExp
      };
  
      if (remainingExp <= 0) break; // Stop if remaining experience is satisfied
    }
  
    return result;
  };

/**
 * Calculates total material needs considering synthesizable materials (e.g., common, forgery).
 *
 * @param {Object} totalNeeds - Object containing total material requirements.
 * @param {Array} synthesizableTypes - Array of synthesizable material types (e.g., ['common', 'forgery']).
 * @returns {Object} Updated total material needs including synthesized materials.
 */
export const calculateTotalMaterialNeeds = (totalNeeds, synthesizableTypes = ['common', 'forgery']) => {
    const updatedNeeds = { ...totalNeeds };
  
    synthesizableTypes.forEach((type) => {
      const materials = Object.values(inventoryItem[type])
        .sort((a, b) => b.rarity - a.rarity); // 높은 rarity부터 낮은 rarity로 정렬
  
      // 역순으로 합성 목표를 설정
      for (let i = 0; i < materials.length - 1; i++) {
        const currentMaterial = materials[i]; // 높은 rarity 재료
        const nextMaterial = materials[i + 1]; // 낮은 rarity 재료
        const synthesisCost = 3; // 합성 비용: 3개 -> 1개
  
        // 현재 rarity 재료의 요구량
        const currentNeed = updatedNeeds[currentMaterial.game_id] || 0;
  
        // 다음 rarity 재료의 요구량을 현재 재료로 충족할 수 있는지 확인
        const neededFromNext = currentNeed * synthesisCost;
  
        // 낮은 rarity 재료의 수량 업데이트
        const nextQty = updatedNeeds[nextMaterial.game_id] || 0;
  
        if (nextQty >= neededFromNext) {
          updatedNeeds[nextMaterial.game_id] -= neededFromNext; // 필요한 만큼 소모
        } else {
          // 부족한 경우만큼 현재 rarity 요구량 재조정
          const remainingNeed = Math.ceil((neededFromNext - nextQty) / synthesisCost);
          updatedNeeds[currentMaterial.game_id] = remainingNeed;
          updatedNeeds[nextMaterial.game_id] = 0; // 남는 낮은 rarity 제거
        }
      }
    });
  
    // 음수 값 제거 및 필요 없는 항목 삭제
    Object.keys(updatedNeeds).forEach((key) => {
      if (updatedNeeds[key] <= 0) {
        delete updatedNeeds[key];
      }
    });
  
    return updatedNeeds;
  };