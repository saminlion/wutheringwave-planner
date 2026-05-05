/**
 * NTE (Neverness To Everness) Material Processor
 */
import { findMaterial, getMaterialField } from '@/services/materialHelper/dbUtils';
import logger from '@/utils/logger';

export const SUPPORTED_KEYS = ['common', 'forgery', 'boss', 'weeklyBoss'];

/**
 * @param {Object} materials - Accumulator
 * @param {string} key - Material key
 * @param {any} value - [qty, tier] for tiered, qty for direct
 * @param {Object} characterInfo - Character/weapon metadata
 * @returns {boolean} true if handled
 */
export const processMaterial = (materials, key, value, characterInfo) => {
    // Tiered materials: common (T1-T3), forgery (T1-T3)
    if (['common', 'forgery'].includes(key)) {
        const [qty, tier] = value;
        const subCategory = characterInfo[key];

        logger.debug('[NTE] processMaterial:', key, 'subCategory:', subCategory, 'tier:', tier);
        const material = findMaterial(key, subCategory, tier);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + qty;
            }
        }
        return true;
    }

    // Direct game_id materials: boss, weeklyBoss
    if (['boss', 'weeklyBoss'].includes(key)) {
        const gameId = characterInfo[key];
        const material = findMaterial(key, gameId, null, true);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + value;
            }
        }
        return true;
    }

    return false;
};

export default {
    SUPPORTED_KEYS,
    processMaterial,
};
