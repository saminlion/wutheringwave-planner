import config, { wutheringWaveConfig } from './config';
import {
  characters as characterData,
  weapons as weaponData,
  materials as inventoryMaterials,
  costs as costData,
  tieredMaterials,
  tieredMaterialsByGameId,
  player_exp_material as playerExpMaterial,
} from './data';

// Game-specific components
import CharacterDialog from './components/CharacterDialog.vue';

// Game-specific material processor
import * as materialProcessor from './materialProcessor';

const dataCache = {
  characters: characterData,
  weapons: weaponData,
  materials: inventoryMaterials,
  costs: costData,
  tiers: tieredMaterials,
};

export const wutheringWavePlugin = {
  id: wutheringWaveConfig.id,
  name: wutheringWaveConfig.name,
  version: wutheringWaveConfig.version,
  config: wutheringWaveConfig,

  // Game-specific components
  components: {
    CharacterDialog,
  },

  // Game-specific material processor
  materialProcessor,

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

export default wutheringWavePlugin;
export {
  config,
  wutheringWaveConfig,
  characterData,
  weaponData,
  inventoryMaterials,
  costData,
  tieredMaterials,
  tieredMaterialsByGameId,
  playerExpMaterial,
};

