/**
 * Mongil StarDive Game Plugin
 */
import config, { mongilstardiveConfig } from './config.js';
import { characters, weapons, materials, costs, tieredMaterials, tieredMaterialsByGameId } from './data/index.js';
import CharacterDialog from './components/CharacterDialog.vue';
import * as materialProcessor from './materialProcessor.js';

const dataCache = { characters, weapons, materials, costs, tiers: tieredMaterials };

const mongilstardivePlugin = {
  id: 'mongilstardive',
  name: 'Mongil StarDive',
  displayName: 'MSD',
  version: '1.0.0',

  config,
  components: { CharacterDialog },
  materialProcessor,

  materials: {
    database: materials,
    tiers: tieredMaterials,
    tiersByGameId: tieredMaterialsByGameId,
    synthesis: {
      ratio: 3,
      tierLevels: 5,
      supportsDecomposition: false,
    },
  },
  costs,
  data: { characters, weapons },

  async install() { return Promise.resolve(); },
  async uninstall() { return Promise.resolve(); },
  getData(type) { return dataCache[type] ?? null; },
};

export default mongilstardivePlugin;
export { config, mongilstardiveConfig, characters, weapons, materials, costs, tieredMaterials, tieredMaterialsByGameId };
