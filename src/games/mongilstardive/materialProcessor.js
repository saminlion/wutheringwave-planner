/**
 * Mongil StarDive Material Processor
 */
import { findMaterial, getMaterialField } from '@/services/materialHelper/dbUtils';
import { useGameStore } from '@/store/game';
import logger from '@/utils/logger';

export const SUPPORTED_KEYS = ['forgery_skill', 'forgery_ascension', 'forgery_weapon', 'mastery'];

const getMasteryGameId = () => {
    const gameStore = useGameStore();
    const materials = gameStore.getData('materials') || {};
    const masteryItems = Object.values(materials.mastery || {});
    return masteryItems[0]?.game_id || null;
};

export const processMaterial = (materials, key, value, characterInfo) => {
    // Tiered forgery: all three types look up materials['forgery'] by SubCategory
    if (key === 'forgery_skill' || key === 'forgery_ascension' || key === 'forgery_weapon') {
        const [qty, tier] = value;
        // forgery_skill → character.forgery_skill, forgery_ascension → character.forgery_ascension
        // forgery_weapon → weapon.forgery
        const subCategory = key === 'forgery_weapon'
            ? characterInfo.forgery
            : characterInfo[key];

        logger.debug('[Mongil] processMaterial:', key, 'subCategory:', subCategory, 'tier:', tier);
        const material = findMaterial('forgery', subCategory, tier);
        if (material) {
            const mKey = getMaterialField(material, 'game_id');
            if (mKey) materials[mKey] = (materials[mKey] || 0) + qty;
        }
        return true;
    }

    // mastery: single game-wide item, quantity-based
    if (key === 'mastery') {
        const gameId = getMasteryGameId();
        if (gameId) materials[gameId] = (materials[gameId] || 0) + value;
        return true;
    }

    return false;
};

export default { SUPPORTED_KEYS, processMaterial };
