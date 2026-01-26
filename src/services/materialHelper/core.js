import { findMaterial, getMaterialField } from "./dbUtils";
import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

/**
 * Get current game's credit game_id
 */
const getCreditGameId = () => {
    const gameStore = useGameStore();
    const materials = gameStore.getData('materials') || {};
    const creditCategory = materials.credit || {};
    const firstCredit = Object.values(creditCategory)[0];
    return firstCredit?.game_id || null;
};

/**
 * Get current game's material processor
 */
const getGameMaterialProcessor = () => {
    const gameStore = useGameStore();
    const currentGame = gameStore.currentGame;
    return currentGame?.materialProcessor || null;
};

/**
 * Processes a material based on its key and adds the required quantity to the materials object.
 * Uses dynamic dispatch to game-specific processors for game-specific keys.
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

    // Try game-specific processor first
    const gameProcessor = getGameMaterialProcessor();
    if (gameProcessor?.processMaterial) {
        const handled = gameProcessor.processMaterial(materials, key, value, characterInfo);
        if (handled) {
            return; // Game-specific processor handled this key
        }
    }

    // Common logic for all games below

    // === credit (all games) ===
    if (key === 'credit') {
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
        return;
    }

    // === player_exp, weapon_exp (numeric total, all games) ===
    if (['player_exp', 'weapon_exp'].includes(key)) {
        materials[key] = (materials[key] || 0) + value;
        return;
    }

    // === Skip level key ===
    if (key === 'level') {
        return;
    }

    // === Fallback: add directly (perseverance, etc.) ===
    logger.debug(`processMaterials: Unknown key "${key}", adding directly`);
    materials[key] = (materials[key] || 0) + value;
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
