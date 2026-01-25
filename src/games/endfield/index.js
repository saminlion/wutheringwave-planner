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

// データキャッシュ（WWプラグインと同じインターフェース）
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

  // ゲーム専用コンポーネント
  components: {
    CharacterDialog,
  },

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
