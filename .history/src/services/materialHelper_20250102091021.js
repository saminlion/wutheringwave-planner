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
        //console.warn(`Material type "${type}" not found in inventory.`);
        return null;
    }

    if (useId) {
        // game_id 기반 검색
        // console.log(`Searching by game_id: ${identifier}`);
        //console.log(`Searching in type "${type}":`, JSON.stringify(inventoryItem[type], null, 2));
        const materialData = Object.values(inventoryItem[type]).find(
            (item) => String(item.game_id) === String(identifier) // 문자열 비교
        );
        if (!materialData) {
            //console.warn(`Material with game_id "${identifier}" not found in type "${type}".`);
            return null;
        }
        return materialData;
    } else {
        // SubCategory 기반 검색
        //console.log(`Searching by SubCategory: ${identifier}, Rarity: ${rarity}`);
        const matchedItem = Object.values(inventoryItem[type]).find(
            (item) => item.SubCategory === identifier && (!rarity || item.rarity === rarity)
        );
        if (!matchedItem) {
            // console.warn(`Material with SubCategory "${identifier}" not found in type "${type}".`);
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

        if (key == 'credit') {
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

        console.log('ownedCount', ownedCount);

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
 * Performs forward synthesis considering shortages.
 */
export const performItemSynthesisWithNeeds = (inventory, tieredMaterials, shortages) => {
    const synthesisResults = {};
  
    for (const category in tieredMaterials) {
      const materialData = tieredMaterials[category];
  
      for (const rarity of Object.keys(materialData).sort((a, b) => a - b)) {
        const currentLevel = materialData[rarity];
        const nextLevel = materialData[+rarity + 1];
  
        if (!nextLevel) continue;
  
        const currentGameId = currentLevel.game_id;
        const nextGameId = nextLevel.game_id;
  
        const currentCount = inventory[currentGameId] || 0;
        const needed = shortages[currentGameId] || 0;
        const requiredCount = currentLevel.synthesizable?.count || 1;
  
        const availableForSynthesis = Math.max(0, currentCount - needed);
        const synthesisQty = Math.floor(availableForSynthesis / requiredCount);
  
        if (synthesisQty > 0) {
          inventory[currentGameId] -= synthesisQty * requiredCount;
          inventory[nextGameId] = (inventory[nextGameId] || 0) + synthesisQty;
          synthesisResults[currentGameId] = {
            used: synthesisQty * requiredCount,
            synthesized: synthesisQty,
          };
        }
      }
    }
  
    return { updatedInventory: inventory, synthesisResults };
  };

  
/**
 * Performs backward conversion to handle surplus materials.
 */
export const backwardConversion = (inventory, tieredMaterials, shortages) => {
    if (!inventory || typeof inventory !== 'object') {
        console.error("[Error] Inventory is undefined or invalid.");
        return {};
    }

    if (!tieredMaterials || typeof tieredMaterials !== 'object') {
        console.error("[Error] Tiered Materials is undefined or invalid.");
        return {};
    }

    if (!shortages || typeof shortages !== 'object') {
        console.error("[Error] Shortages is undefined or invalid.");
        return {};
    }

    const finalNeeds = { ...shortages }; // Copy shortages to calculate final needs

    for (const category in tieredMaterials) {
        const materialData = tieredMaterials[category];
        const rarities = Object.keys(materialData).sort((a, b) => b - a); // Descending rarity

        for (const rarity of rarities) {
            const material = materialData[rarity];
            const materialGameId = material.game_id;
            const nextRarity = +rarity - 1;
            const nextMaterial = materialData[nextRarity];
            const nextMaterialGameId = nextMaterial?.game_id;

            // Update shortages based on current inventory
            if (materialGameId in finalNeeds) {
                const required = finalNeeds[materialGameId];
                const available = inventory[materialGameId] || 0;
                finalNeeds[materialGameId] = Math.max(0, required - available);
                inventory[materialGameId] = Math.max(0, available - required);
            }

            // Convert surplus to lower rarity
            if (nextMaterialGameId) {
                const surplus = inventory[materialGameId] || 0;
                const converted = surplus * 3; // Conversion factor
                inventory[materialGameId] = 0;
                inventory[nextMaterialGameId] = (inventory[nextMaterialGameId] || 0) + converted;
            }
        }
    }

    console.log("[Debug] Final Needs Calculated in Backward Conversion:", finalNeeds);
    return finalNeeds; // Return final calculated needs
};



/**
 * Calculates materials using forward and backward synthesis.
 */
export const calculateMaterials = (inventory, tieredMaterials, shortages) => {
    console.log("[Debug] Initial Inventory:", inventory);
    console.log("[Debug] Initial Shortages:", shortages);

    // Forward synthesis
    const forwardResult = performItemSynthesisWithNeeds(inventory, tieredMaterials, shortages);
    console.log("[Debug] After Forward Synthesis:", forwardResult);

    // Backward conversion
    const finalNeeds = backwardConversion(forwardResult.updated_inventory, tieredMaterials, shortages);
    if (!finalNeeds || typeof finalNeeds !== 'object') {
        console.error("[Error] Backward Conversion returned invalid result:", finalNeeds);
        return { final_inventory: {}, synthesis_results: {}, final_needs: {} };
    }

    console.log("[Debug] Final Needs After Backward Conversion:", finalNeeds);

    // Return updated inventory, synthesis results, and final needs
    return {
        final_inventory: forwardResult.updated_inventory,
        synthesis_results: forwardResult.synthesis_results,
        final_needs: finalNeeds
    };
};
