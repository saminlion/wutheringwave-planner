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

// Game-specific components
import CharacterDialog from './components/CharacterDialog.vue';

// Game-specific material processor
import * as materialProcessor from './materialProcessor.js';

// Data cache (same interface as WW plugin)
const dataCache = {
  characters,
  weapons,
  materials,
  costs,
  tiers: tieredMaterials,
};

const endfieldPlugin = {
  id: 'endfield',
  name: 'Endfield',
  displayName: 'Endfield',
  version: '1.0.0',

  // Game configuration
  config,

  // Game-specific components
  components: {
    CharacterDialog,
  },

  // Game-specific material processor
  materialProcessor,

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

  // WWプラグインと同じインターフェース
  async install() {
    return Promise.resolve();
  },
  async uninstall() {
    return Promise.resolve();
  },
  getData(type) {
    return dataCache[type] ?? null;
  },
};

export default endfieldPlugin;
