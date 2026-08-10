/**
 * Duet Night Abyss Material Processor
 *
 * Three things make DNA different from the other plugins:
 *
 * 1. `ascension` is a SubCategory name, not a game_id. DNA ascension materials
 *    come in three tiers per element, so they resolve like `common`/`forgery`
 *    rather than like WW's single boss drop.
 * 2. A single cost entry can demand two tiers of the same category
 *    (skill Lv1→2 needs common T1 ×3 AND common T2 ×1), so tiered keys accept
 *    the nested `[[qty, tier], [qty, tier]]` form as well as `[qty, tier]`.
 * 3. Weapons need two distinct weapon_component SubCategories, addressed as
 *    `weapon_component_a` / `weapon_component_b`.
 */
import { findMaterial, getMaterialField } from '@/services/materialHelper/dbUtils';
import logger from '@/utils/logger';

/**
 * Cost key -> where to look the material up.
 *
 * `subCategoryField` names the character/weapon field holding the SubCategory.
 * A null field means the SubCategory is fixed for the whole game.
 */
const TIERED_KEYS = {
  common: { category: 'common', subCategoryField: 'common' },
  forgery: { category: 'forgery', subCategoryField: 'forgery' },
  ascension: { category: 'ascension', subCategoryField: 'ascension' },
  talent: { category: 'talent', subCategoryField: 'talent' },
  weapon_component_a: { category: 'weapon_component', subCategoryField: 'component_a' },
  weapon_component_b: { category: 'weapon_component', subCategoryField: 'component_b' },
};

/**
 * Untiered keys with a SubCategory that is the same for every character.
 * `forgery_luno` is Luno Memento; `event` is Twilight Tread, which cannot be
 * farmed at all and is surfaced as a hard blocker in the planner.
 */
const FIXED_KEYS = {
  forgery_luno: { category: 'forgery', subCategory: 'luno' },
  event: { category: 'event', subCategory: 'twilight' },
};

/** Keys whose value is a game_id stored on the character. */
const DIRECT_ID_KEYS = ['weeklyBoss'];

export const SUPPORTED_KEYS = [
  ...Object.keys(TIERED_KEYS),
  ...Object.keys(FIXED_KEYS),
  ...DIRECT_ID_KEYS,
];

const addMaterial = (materials, material, qty) => {
  if (!material) return;
  const gameId = getMaterialField(material, 'game_id');
  if (gameId) {
    materials[gameId] = (materials[gameId] || 0) + qty;
  }
};

/**
 * Process a DNA-specific material.
 *
 * @param {Object} materials - accumulator, keyed by game_id
 * @param {string} key - cost key
 * @param {any} value - [qty, tier] / [[qty, tier], ...] / qty
 * @param {Object} entityInfo - character or weapon metadata
 * @returns {boolean} true when handled
 */
export const processMaterial = (materials, key, value, entityInfo) => {
  const tiered = TIERED_KEYS[key];
  if (tiered) {
    const subCategory = entityInfo?.[tiered.subCategoryField];
    if (!subCategory) {
      logger.warn(`[DNA] ${key}: "${tiered.subCategoryField}" missing on ${entityInfo?.display_name}`);
      return true;
    }

    // [[qty, tier], [qty, tier]] when one step needs two tiers, else [qty, tier]
    const entries = Array.isArray(value[0]) ? value : [value];
    for (const [qty, tier] of entries) {
      const material = findMaterial(tiered.category, subCategory, tier);
      if (material) {
        addMaterial(materials, material, qty);
      } else {
        logger.warn(`[DNA] Material not found: ${tiered.category}/${subCategory} T${tier}`);
      }
    }
    return true;
  }

  const fixed = FIXED_KEYS[key];
  if (fixed) {
    const material = findMaterial(fixed.category, fixed.subCategory, null);
    if (material) {
      addMaterial(materials, material, value);
    } else {
      logger.warn(`[DNA] Material not found: ${fixed.category}/${fixed.subCategory}`);
    }
    return true;
  }

  if (DIRECT_ID_KEYS.includes(key)) {
    const gameId = entityInfo?.[key];
    if (!gameId) {
      logger.warn(`[DNA] ${key}: game_id missing on ${entityInfo?.display_name}`);
      return true;
    }
    const material = findMaterial(key, gameId, null, true);
    if (material) {
      addMaterial(materials, material, value);
    } else {
      logger.warn(`[DNA] Material not found: ${key}/${gameId}`);
    }
    return true;
  }

  return false; // credit / player_exp / weapon_exp fall through to core.js
};

export default {
  SUPPORTED_KEYS,
  processMaterial,
};
