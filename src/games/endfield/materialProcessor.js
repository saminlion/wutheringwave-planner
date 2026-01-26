/**
 * Endfield Material Processor
 * Handles Endfield-specific material key processing
 */
import { findMaterial, getMaterialField, getMaterialFieldById } from '@/services/materialHelper/dbUtils';
import logger from '@/utils/logger';

/**
 * Endfield-specific material keys
 */
export const SUPPORTED_KEYS = [
    'proto_asc', 'proto_skill', 'cast_die',  // Forgery tiered materials
    'bolete', 'odendra', 'onyx',              // Character-specific ascension materials
    'special',                                 // Direct game_id material
];

/**
 * Process Endfield-specific material
 * @param {Object} materials - The materials accumulator object
 * @param {string} key - Material key
 * @param {any} value - Value ([qty, tier] for tiered, qty for direct)
 * @param {Object} characterInfo - Character/weapon metadata
 * @returns {boolean} - true if processed, false if not supported
 */
export const processMaterial = (materials, key, value, characterInfo) => {
    // Generic tiered materials in forgery category: proto_asc, proto_skill, cast_die
    if (['proto_asc', 'proto_skill', 'cast_die'].includes(key)) {
        const [qty, tier] = value;
        // Search in forgery category where SubCategory = key
        const material = findMaterial('forgery', key, tier);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) {
                materials[mKey] = (materials[mKey] || 0) + qty;
                return true;
            }
        } else {
            logger.warn(`[Endfield] Material not found: ${key}, tier: ${tier}`);
        }
        return true; // Handled
    }

    // Character-specific tiered materials: bolete, odendra, onyx
    if (['bolete', 'odendra', 'onyx'].includes(key)) {
        const [qty, tier] = value;
        // Get game_id from characterInfo, then find SubCategory
        const charMaterialId = characterInfo[key];
        if (charMaterialId) {
            // Get SubCategory from game_id
            const subCategory = getMaterialFieldById(charMaterialId, 'SubCategory');
            if (subCategory) {
                // Search in ascension category with SubCategory and tier
                const material = findMaterial('ascension', subCategory, tier);
                if (material) {
                    const mKey = getMaterialField(material, 'game_id');
                    if (mKey) {
                        materials[mKey] = (materials[mKey] || 0) + qty;
                        return true;
                    }
                } else {
                    logger.warn(`[Endfield] Ascension material not found: ${subCategory}, tier: ${tier}`);
                }
            }
        }
        return true; // Handled
    }

    // Direct game_id material: special
    if (key === 'special') {
        const charMaterialId = characterInfo[key];
        if (charMaterialId && typeof value === 'number') {
            materials[charMaterialId] = (materials[charMaterialId] || 0) + value;
            return true;
        }
        return true; // Handled
    }

    return false; // Not an Endfield-specific key
};

export default {
    SUPPORTED_KEYS,
    processMaterial,
};
