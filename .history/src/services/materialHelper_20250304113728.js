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
 * Extracts specific data (e.g., icon, label, id) from material.
 *
 * @param {Object} material - The material object.
 * @param {string} field - The field to extract (e.g., "icon", "label", "game_id").
 * @returns {string|null} - The value of the specified field or null if not found.
 */
export const getMaterialFieldById = (id, field) => {

   // console.log(`[Debug] Get inventoryItem: ${JSON.stringify(inventoryItem)}`);

    const materialData = Object.values(inventoryItem).flatMap((category) => Object.values(category)).find(
        (item) => String(item.game_id) === String(id) // Match by game_id
    );
    
      if (!materialData) {
        console.warn(`[Warning] Material with ID "${id}" not found in inventoryItem.`);
        return null;
      }
    
      if (field) {
        if (materialData[field] == null) {
          console.warn(`[Warning] Field "${field}" not found in materialData for ID "${id}".`);
          return null;
        }
        console.log(`[Debug] Retrieved field "${field}": ${materialData[field]}`);
        return materialData[field];
      }
    
      // Return entire character object if no field is specified
      console.log(`[Debug] Retrieved entire character data for ID "${id}":`, materialData);
      return materialData;
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

    // if (materials.processed.has(materialKey)) {
    //     console.log(`Skipping duplicate material: ${materialKey}`);
    //     return;
    // }

    materials.processed.add(materialKey);

    // 기존 로직 유지
    if (['common', 'forgery'].includes(key)) {
        const [qty, tier] = value;
        const materialSource = key === 'forgery' ? characterInfo.forgery : characterInfo.common; // forgery와 common 분리

      //  console.log(`CharacterInfo: ${characterInfo} / Forgery: ${characterInfo.forgery} / Common: ${characterInfo.common}`);

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
            gameId = 41001001;
        }

     //   console.log(`[Debug] processMaterials Material Source: ${gameId}, key: ${key}`);

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

        //console.log('ownedCount', ownedCount);

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

const findAllUniqueSubCategories = (inventoryItem, shortages) => {
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

/**
 * Performs forward synthesis considering shortages.
 */
export const performItemSynthesisWithNeeds = (inventory, tieredMaterials, shortages) => {
    const synthesisResults = {};

    //console.log(`[Debug] Initial inventoryItem : ${JSON.stringify(inventoryItem)}`);
    const uniqueSubCategories = findAllUniqueSubCategories(inventoryItem, shortages);

    console.log(`[Debug] Initial Unique SubCategories : ${uniqueSubCategories}`);

    for (const category of uniqueSubCategories) {

        console.log(`[Debug] Current Category: ${category}`);
        console.log(`[Debug] Initial tieredMaterials : ${JSON.stringify(tieredMaterials)}`);

        if (tieredMaterials.hasOwnProperty(category)) {
            const materialData = tieredMaterials[category];

            console.log(`[Debug] Initial Material Data : ${JSON.stringify(materialData)} / Category: ${category}`);

            for (const key in materialData) {

                if (materialData.hasOwnProperty(key)) {
                    const item = materialData[key];
                    console.log(`[Debug] Initial item in MD : ${JSON.stringify(item)}`);
                }

                const currentLevel = materialData[key];
                const nextLevel = materialData[+key + 1];
                if (!nextLevel) continue;
                console.log(`[Debug] Initial Level : ${JSON.stringify(currentLevel)} /   ${JSON.stringify(nextLevel)}`);

                const currentGameId = currentLevel.game_id;
                const nextGameId = nextLevel.game_id;

                console.log(`[Debug] Initial ID : ${currentGameId} /  ${nextGameId}`);
                // 첫 번째 : [Debug] Initial ID : 41100012 /  41100013
                // 두 번째 : [Debug] Initial ID : 41100012 /  41100013
                // 세 번째 : [Debug] Initial ID : 41100013 /  undefined

                const currentCount = inventory[currentGameId] || 0;
                const synthesisCount = currentLevel.synthesizable?.count || 1;
                const needed = shortages[currentGameId] || 0;

                console.log(`[Debug] Initial Current Count: ${currentCount}`);
                // 첫 번째 : [Debug] Initial Current Count: 55
                // 두 번째 : [Debug] Initial Current Count: 17
                // 세 번째 : [Debug] Initial Current Count: 1

                console.log(`[Debug] Initial Needed: ${needed}`);
                // 첫 번째 : [Debug] Initial Needed: 4
                // 두 번째 : [Debug] Initial Needed: 12
                // 세 번째 : [Debug] Initial Needed: 4

                const availableForSynthesis = Math.max(0, currentCount - needed);
                const synthesisQty = Math.floor(availableForSynthesis / synthesisCount);
                console.log("[Debug] Initial Synthesis Qty:", synthesisQty);
                // 첫 번째 : [Debug] Initial Synthesis Qty: 17
                // 두 번째 : [Debug] Initial Synthesis Qty: 1
                // 세 번째 : [Debug] Initial Synthesis Qty: 0

                if (synthesisQty > 0) {
                    inventory[currentGameId] -= synthesisQty * synthesisCount;
                    inventory[nextGameId] = (inventory[nextGameId] || 0) + synthesisQty;

                    console.log("[Debug] Initial Next Inventory:", inventory[nextGameId]);
                    // 첫 번째 : [Debug] Initial Next Inventory: 17
                    // 두 번째 : [Debug] Initial Next Inventory: 1
                    // 세 번째 : 못 들어옴

                    synthesisResults[currentGameId] = {
                        used: synthesisQty * synthesisCount,
                        synthesized: synthesisQty,
                    };
                }
            }
        }

    }
    return { updatedInventory: inventory, synthesisResults };
};

/**
 * Performs backward conversion to handle surplus materials.
 */
export const backwardConversion = (inventory, tieredMaterials, shortages) => {
    const finalNeeds = { ...shortages };
    for (const category in tieredMaterials) {
        const materialData = tieredMaterials[category];
        const rarities = Object.keys(materialData).sort((a, b) => b - a); // Descending rarity
        for (const rarity of rarities) {
            const material = materialData[rarity];
            const materialGameId = material.game_id;
            const nextRarity = +rarity - 1;
            const nextMaterial = materialData[nextRarity];
            const nextMaterialGameId = nextMaterial?.game_id;

            // Update shortages
            if (materialGameId in finalNeeds) {
                const required = finalNeeds[materialGameId];
                const available = inventory[materialGameId] || 0;
                finalNeeds[materialGameId] = Math.max(0, required - available);
                inventory[materialGameId] = Math.max(0, available - required);
            }

            // Convert surplus to lower rarity
            if (nextMaterialGameId) {
                const surplus = inventory[materialGameId] || 0;
                const converted = surplus * 3;
                inventory[materialGameId] = 0;
                inventory[nextMaterialGameId] = (inventory[nextMaterialGameId] || 0) + converted;
            }
        }
    }
    return finalNeeds;
};

/**
 * Calculates materials using forward and backward synthesis.
 */
export const calculateMaterials = (inventory, tieredMaterials, shortages) => {
    console.log("[Debug] Initial Inventory:", inventory);
    console.log("[Debug] Initial Shortages:", shortages);

    const forwardResult = performItemSynthesisWithNeeds(inventory, tieredMaterials, shortages);
    console.log("[Debug] After Forward Synthesis:", forwardResult);

    const finalNeeds = backwardConversion(forwardResult.updatedInventory, tieredMaterials, shortages);
    console.log("[Debug] Final Needs After Backward Conversion:", finalNeeds);

    // Extract synthesized details per game_id
    const synthesizedPerGameId = {};
    for (const [gameId, { synthesized }] of Object.entries(forwardResult.synthesisResults)) {
        synthesizedPerGameId[gameId] = synthesized;
    }

    console.log("[Debug] Synthesized Per Game ID:", synthesizedPerGameId);

    return {
        final_inventory: forwardResult.updatedInventory,
        synthesis_results: forwardResult.synthesisResults,
        final_needs: finalNeeds,
        synthesized_per_game_id: synthesizedPerGameId, // Add synthesized counts per game_id
    };
};