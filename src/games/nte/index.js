/**
 * NTE (Neverness To Everness) Game Plugin Entry Point
 */
import config, { nteConfig } from './config.js';
import {
  characters,
  weapons,
  materials,
  costs,
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
  tiers: tieredMaterials,
};

const ntePlugin = {
  id: 'nte',
  name: 'Neverness To Everness',
  displayName: 'NTE',
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

export default ntePlugin;
export {
  config,
  nteConfig,
  characters,
  weapons,
  materials,
  costs,
  tieredMaterials,
  tieredMaterialsByGameId,
};
