/**
 * Endfield Game Data Exports
 */

import characterData from './character.json';
import weaponData from './weapon.json';
import materialsData from './materials.json';
import costsData from './costs.json';
import synthesisRecipesData from './synthesisRecipes.json';

export const characters = characterData;
export const weapons = weaponData;
export const materials = materialsData;
export const costs = costsData;
export const synthesisRecipes = synthesisRecipesData;

// Tiered materials for synthesis (3:1 ratio)
export const tieredMaterials = {
  common: {
    example_common: {
      1: 51101001, // LF
      2: 51101002, // MF
      3: 51101003, // HF
      4: 51101004, // FF
    },
  },
  forgery: {
    example_forgery: {
      1: 51201001, // LF
      2: 51201002, // MF
      3: 51201003, // HF
      4: 51201004, // FF
    },
  },
};

// Reverse lookup: gameId -> tier info
export const tieredMaterialsByGameId = {};
Object.entries(tieredMaterials).forEach(([category, subcategories]) => {
  Object.entries(subcategories).forEach(([subcategory, tiers]) => {
    Object.entries(tiers).forEach(([tier, gameId]) => {
      tieredMaterialsByGameId[gameId] = {
        category,
        subcategory,
        tier: parseInt(tier),
      };
    });
  });
});

export default {
  characters,
  weapons,
  materials,
  costs,
  synthesisRecipes,
  tieredMaterials,
  tieredMaterialsByGameId,
};
