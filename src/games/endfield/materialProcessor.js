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
    'perseverance',                            // Per-skill mastery material
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
            // The character/weapon-specific material is the final (highest) tier.
            // Multiple variants share the same SubCategory at that tier (e.g. bolete t5 =
            // cosmagaric/bloodcap/taloscap), so a SubCategory+tier lookup is ambiguous and
            // always resolves to the first variant. When the requested tier matches the
            // character's specific material tier, use its exact game_id directly.
            const charTier = getMaterialFieldById(charMaterialId, 'tier');
            if (charTier != null && Number(charTier) === Number(tier)) {
                materials[charMaterialId] = (materials[charMaterialId] || 0) + qty;
                return true;
            }
            // Lower tiers are shared within a SubCategory (one material per tier).
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
    // In mastery context (_masterySkill set), use per-skill mastery material instead
    if (key === 'special') {
        const skillName = characterInfo._masterySkill;
        let charMaterialId = characterInfo[key];
        if (skillName) {
            const perSkillId = characterInfo[`mastery_${skillName}`];
            if (perSkillId) {
                charMaterialId = perSkillId;
            } else {
                // Missing per-skill column in the sheet: fall back to the generic
                // `special` material rather than silently dropping the cost.
                logger.warn(`[Endfield] No mastery_${skillName} material for character; falling back to 'special'`);
            }
        }
        if (charMaterialId && typeof value === 'number') {
            materials[charMaterialId] = (materials[charMaterialId] || 0) + value;
        }
        return true;
    }

    // Fixed perseverance material: Mark of Perseverance (5140010039)
    if (key === 'perseverance') {
        const gameId = 5140010039;
        if (typeof value === 'number') {
            materials[gameId] = (materials[gameId] || 0) + value;
        }
        return true;
    }

    return false; // Not an Endfield-specific key
};

export default {
    SUPPORTED_KEYS,
    processMaterial,
};
