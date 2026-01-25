import { findMaterial, getMaterialField, getMaterialFieldById } from "./dbUtils";
import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

/**
 * 現在のゲームのcredit game_idを取得
 */
const getCreditGameId = () => {
    const gameStore = useGameStore();
    const materials = gameStore.getData('materials') || {};
    const creditCategory = materials.credit || {};
    // creditカテゴリの最初のアイテムのgame_idを取得
    const firstCredit = Object.values(creditCategory)[0];
    return firstCredit?.game_id || null;
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
    logger.debug('processMaterials Material key:', key, 'value:', value);

    materials.processed.add(materialKey);

    // === WW: common, forgery ===
    // === Endfield generic tiered: proto_asc, proto_skill, cast_die ===
    if (['common', 'forgery'].includes(key)) {
        const [qty, tier] = value;
        const materialSource = key === 'forgery' ? characterInfo.forgery : characterInfo.common;

        logger.debug('processMaterials Material Source:', materialSource, ', Tier:', tier);
        const material = findMaterial(key, materialSource, tier);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + qty;
            }
        }
    }
    // === Endfield generic tiered materials (SubCategory = key itself) ===
    else if (['proto_asc', 'proto_skill', 'cast_die'].includes(key)) {
        const [qty, tier] = value;
        // forgeryカテゴリ内でSubCategory=keyで検索
        const material = findMaterial('forgery', key, tier);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + qty;
            }
        } else {
            logger.warn(`Endfield material not found: ${key}, tier: ${tier}`);
        }
    }
    // === Endfield character-specific tiered materials ===
    else if (['bolete', 'odendra', 'onyx'].includes(key)) {
        const [qty, tier] = value;
        // characterInfoからgame_idを取得し、そのSubCategoryを見つける
        const charMaterialId = characterInfo[key];
        if (charMaterialId) {
            // game_idからSubCategoryを取得
            const subCategory = getMaterialFieldById(charMaterialId, 'SubCategory');
            if (subCategory) {
                // ascensionカテゴリ内で該当SubCategoryとtierで検索
                const material = findMaterial('ascension', subCategory, tier);
                if (material) {
                    const mKey = getMaterialField(material, 'game_id');
                    if (mKey) {
                        materials[mKey] = (materials[mKey] || 0) + qty;
                    }
                } else {
                    logger.warn(`Endfield ascension material not found: ${subCategory}, tier: ${tier}`);
                }
            }
        }
    }
    // === Endfield special material (direct quantity, no tier) ===
    else if (key === 'special') {
        const charMaterialId = characterInfo[key];
        if (charMaterialId && typeof value === 'number') {
            materials[charMaterialId] = (materials[charMaterialId] || 0) + value;
        }
    }
    // === WW: ascension, boss, weeklyBoss ===
    else if (['ascension', 'boss', 'weeklyBoss'].includes(key)) {
        let gameId = characterInfo[key];
        const categoryKey = key === 'weeklyBoss' ? 'weekly' : key;
        const material = findMaterial(categoryKey, gameId, null, true);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + value;
            }
        }
    }
    // === credit (both games) ===
    else if (key === 'credit') {
        const gameId = getCreditGameId();
        if (!gameId) {
            logger.warn('Credit game_id not found for current game');
            return;
        }
        const material = findMaterial('credit', gameId, null, true);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + value;
            }
        }
    }
    // === player_exp, weapon_exp (numeric total) ===
    else if (['player_exp', 'weapon_exp'].includes(key)) {
        materials[key] = (materials[key] || 0) + value;
    }
    // === その他 (perseverance等) - 無視せず直接追加 ===
    else if (key !== 'level') {
        logger.debug(`processMaterials: Unknown key "${key}", adding directly`);
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
        const neededCount = Math.ceil(remainingExp / exp_value);
        const ownedCount = ownedMaterials[materialId] || 0;

        const usedCount = Math.min(neededCount, ownedCount || neededCount);

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