/**
 * Endfield Game Data Exports
 */

import characterData from './character.json';
import weaponData from './weapon.json';
import materialsData from './materials.json';
import costsData from './costs.json';
import eventsData from './events.json';
import synthesisRecipesData from './synthesisRecipes.json';

export const characters = characterData;
export const weapons = weaponData;
export const materials = materialsData;
export const costs = costsData;
export const events = eventsData;
export const synthesisRecipes = synthesisRecipesData;

// Tiered synthesis table. Empty: Endfield has no tier-up crafting the planner models.
// If one is added, key it by SubCategory and take every game_id from materials.json —
// tests/games/data-integrity.test.js fails on any id the data does not contain.
export const tieredMaterials = {};

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
  events,
  synthesisRecipes,
  tieredMaterials,
  tieredMaterialsByGameId,
};
