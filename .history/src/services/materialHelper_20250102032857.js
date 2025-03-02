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
 * Calculates total material needs considering synthesizable materials (e.g., common, forgery).
 *
 * @param {Object} totalNeeds - Object containing total material requirements.
 * @param {Object} inventory - User's inventory.
 * @param {Array} synthesizableTypes - Array of synthesizable material types (e.g., ['common', 'forgery']).
 * @returns {Object} Updated total material needs including synthesized materials.
 */
export const calculateTotalMaterialNeeds = (totalNeeds, inventory, synthesizableTypes = ['common', 'forgery']) => {
    // 현재 재료들에서 필요한 양을 담은 객체를 복사하여 수정 가능한 객체로 만듬.
    const updatedNeeds = { ...totalNeeds };
// inventory의 각 항목에 대해 NaN 또는 null이 있는지 확인하고, NaN이거나 null이면 0으로 업데이트
const updatedOwneds = Object.keys(inventory).reduce((acc, key) => {
    const value = inventory[key];

    // value가 null이거나 NaN인 경우 0으로 업데이트
    acc[key] = (value === null || isNaN(value)) ? 0 : value;

    return acc;
}, {});

    console.log('totalNeeds:', updatedNeeds); // 전체 필요량 로그
    console.log('updateOwneds:', updatedOwneds); // 전체 필요량 로그

    // 합성 가능한 타입들에 대해 순차적으로 처리
    synthesizableTypes.forEach((type) => {
        // 해당 타입의 재료들을 가져온 후, totalNeeds에 있는 game_id와 일치하는 아이템만 필터링
        const materials = Object.values(inventoryItem[type])
            .filter(item => totalNeeds.hasOwnProperty(item.game_id)) // totalNeeds에 있는 game_id만 필터링
            .sort((a, b) => a.rarity - b.rarity); // rarity 기준으로 오름차순 정렬

        console.log('materials:', materials); // 합성 대상 재료들 확인

        // 합성 처리: 낮은 rarity부터 높은 rarity로 순차적으로 합성 진행
        for (let i = 0; i < materials.length - 1; i++) {
            const currentMaterial = materials[i]; // 현재 처리할 재료
            const nextMaterial = materials[i + 1]; // 다음 재료
            const synthesisCost = 3; // 합성 비용: 3개 → 1개 (이 부분에서 중요한 부분: 3개로 1개 생성)

            // 현재 재료의 필요량 (totalNeeds에 저장된 값)
            const needQty = updatedNeeds[currentMaterial.game_id] || 0;
            // 현재 재료의 보유량 (inventory에서 확인)
            const ownedQty = updatedOwneds[currentMaterial.game_id] || 0;

            console.log(`inventory: ${updatedOwneds[currentMaterial.game_id]} / currentMaterial.game_id: ${currentMaterial.game_id}`);

            console.log(`needQty: ${needQty} / ownedQty: ${ownedQty}`);

            // 합성 가능 수량 계산 (보유량에서 필요한 양만큼 합성 가능)
            const synthesizableQty = Math.max(0, Math.floor((ownedQty - needQty) / synthesisCost));

            console.log(`synthesizedQty: ${synthesizableQty} / currentMaterial.game_id: ${currentMaterial.game_id}`);

            if (synthesizableQty > 0) {
                // 합성 후 업데이트
                updatedOwneds[nextMaterial.game_id] += synthesizableQty;  // 다음 재료의 필요량 업데이트
            }
        }
    });

    // 음수 값을 제거 (합성된 재료가 부족하면 0으로 처리)
    Object.keys(updatedNeeds).forEach((key) => {
        if (updatedNeeds[key] < 0) updatedNeeds[key] = 0;
    });

    console.log(`Updated Needs after synthesis: ${JSON.stringify(updatedNeeds, null, 2)}`);

    return updatedNeeds; // 최종 합성된 결과를 반환
};
/**
 * Checks if a material is synthesizable.
 *
 * @param {string|number} materialId - The material ID to check.
 * @param {Array<string>} synthesizableTypes - Types of materials that are synthesizable.
 * @returns {boolean} - True if the material is synthesizable, otherwise false.
 */
export const isSynthesizable = (materialId, synthesizableTypes) => {

    console.warn(`synthesizable에서 '${materialId}'를 찾는 중.`);

    if (!inventoryItem) {
        console.error("inventoryItem 데이터가 로드되지 않았습니다.");
        return false;
    }

    return synthesizableTypes.some((type) => {
        console.log(`[Debug] 검사 중인 유형: ${type}`);
        if (!inventoryItem[type]) {
            console.warn(`synthesizableTypes에서 '${type}'가 inventoryItem에 없습니다.`);
            return false;
        }

        const material = findMaterial(type, materialId, null, true);
        console.log(`[Debug] Material 찾기 결과 for ${materialId} in ${type}:`, material);
        return material !== null;
    });
};