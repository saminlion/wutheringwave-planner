/**
 * GFL2 Material Processor
 * Handles GFL2-specific material key processing
 */
import { findMaterial, getMaterialField } from '@/services/materialHelper/dbUtils';
import logger from '@/utils/logger';

/**
 * GFL2-specific material keys
 */
export const SUPPORTED_KEYS = [
  'forgery_stock_boost_bar',
  'forgery_transcription_conductor',
  'rare_material',
  'doll_exp',
];

/**
 * Process GFL2-specific material
 * @param {Object} materials - The materials accumulator object
 * @param {string} key - Material key
 * @param {any} value - Value ([qty, tier] or [[qty, tier], ...] for tiered, qty for direct)
 * @param {Object} characterInfo - Character/weapon metadata
 * @returns {boolean} - true if processed, false if not supported
 */
export const processMaterial = (materials, key, value, characterInfo) => {
  // Tiered forgery materials: stock_boost_bar, transcription_conductor
  if (key === 'forgery_stock_boost_bar' || key === 'forgery_transcription_conductor') {
    const subCategory = key.replace('forgery_', '');

    // Handle multi-tier arrays: [[qty, tier], [qty, tier]] or single [qty, tier]
    const entries = Array.isArray(value[0]) ? value : [value];

    for (const [qty, tier] of entries) {
      const material = findMaterial('forgery', subCategory, tier);
      if (material) {
        const gameId = getMaterialField(material, 'game_id');
        if (gameId) {
          materials[gameId] = (materials[gameId] || 0) + qty;
        }
      } else {
        logger.warn(`[GFL2] Material not found: forgery/${subCategory}, tier: ${tier}`);
      }
    }
    return true;
  }

  // Direct rare_material (no tier)
  if (key === 'rare_material') {
    const material = findMaterial('rare_material', 'rare_material', null);
    if (material) {
      const gameId = getMaterialField(material, 'game_id');
      if (gameId) {
        materials[gameId] = (materials[gameId] || 0) + value;
      }
    } else {
      logger.warn('[GFL2] rare_material not found');
    }
    return true;
  }

  // EXP category: doll_exp (treated like player_exp)
  if (key === 'doll_exp') {
    materials['doll_exp'] = (materials['doll_exp'] || 0) + value;
    return true;
  }

  return false; // Not a GFL2-specific key
};

export default {
  SUPPORTED_KEYS,
  processMaterial,
};
