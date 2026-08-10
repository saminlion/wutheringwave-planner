/**
 * Duet Night Abyss Game Plugin Entry Point
 */
import config from './config.js';
import {
  characters,
  weapons,
  materials,
  costs,
  events,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data/index.js';

import CharacterDialog from './components/CharacterDialog.vue';
import * as materialProcessor from './materialProcessor.js';

const dataCache = {
  characters,
  weapons,
  materials,
  costs,
  events,
  tiers: tieredMaterials,
};

const dnaPlugin = {
  id: 'dna',
  name: 'Duet Night Abyss',
  displayName: 'DNA',
  version: '1.0.0',

  config,

  components: {
    CharacterDialog,
  },

  materialProcessor,

  materials: {
    database: materials,
    tiers: tieredMaterials,
    tiersByGameId: tieredMaterialsByGameId,
    synthesis: {
      ratio: 3,
      tierLevels: 3,
      supportsDecomposition: false,
    },
  },
  costs,
  data: {
    characters,
    weapons,
  },

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

export default dnaPlugin;
