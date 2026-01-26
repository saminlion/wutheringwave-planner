/**
 * WutheringWaves Material Processor
 * Handles WW-specific material key processing
 */
import { findMaterial, getMaterialField } from '@/services/materialHelper/dbUtils';
import logger from '@/utils/logger';

/**
 * WW-specific material keys
 */
export const SUPPORTED_KEYS = ['common', 'forgery', 'ascension', 'boss', 'weeklyBoss'];

/**
 * Process WW-specific material
 * @param {Object} materials - The materials accumulator object
 * @param {string} key - Material key (common, forgery, ascension, boss, weeklyBoss)
 * @param {any} value - Value ([qty, tier] for tiered, qty for direct)
 * @param {Object} characterInfo - Character/weapon metadata
 * @returns {boolean} - true if processed, false if not supported
 */
export const processMaterial = (materials, key, value, characterInfo) => {
    // Tiered materials: common, forgery
    if (['common', 'forgery'].includes(key)) {
        const [qty, tier] = value;
        const materialSource = key === 'forgery' ? characterInfo.forgery : characterInfo.common;

        logger.debug('[WW] processMaterial:', key, 'source:', materialSource, 'tier:', tier);
        const material = findMaterial(key, materialSource, tier);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + qty;
                return true;
            }
        }
        return true; // Handled but not found
    }

    // Direct game_id materials: ascension, boss, weeklyBoss
    if (['ascension', 'boss', 'weeklyBoss'].includes(key)) {
        const gameId = characterInfo[key];
        const categoryKey = key === 'weeklyBoss' ? 'weekly' : key;
        const material = findMaterial(categoryKey, gameId, null, true);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + value;
                return true;
            }
        }
        return true; // Handled but not found
    }

    return false; // Not a WW-specific key
};

export default {
    SUPPORTED_KEYS,
    processMaterial,
};
