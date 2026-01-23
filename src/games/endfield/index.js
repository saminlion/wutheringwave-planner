/**
 * Endfield Game Plugin Entry Point
 */
import config from './config.js';
import {
  characters,
  weapons,
  materials,
  costs,
  synthesisRecipes,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data/index.js';

const endfieldPlugin = {
  id: 'endfield',
  name: 'Endfield',
  displayName: 'Endfield',
  version: '1.0.0',

  // Game configuration
  config,

  // Game data
  materials: {
    database: materials,
    tiers: tieredMaterials,
    tiersByGameId: tieredMaterialsByGameId,
    synthesis: {
      type: 'recipe', // Endfield uses recipe-based synthesis (e.g., 1:3:1)
      ratio: null, // Not applicable for recipe-based synthesis
      tierLevels: 4,
      recipes: synthesisRecipes, // Recipe-based synthesis data
    },
  },
  costs,
  data: {
    characters,
    weapons,
  },
};

export default endfieldPlugin;
