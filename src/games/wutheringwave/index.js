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

  // ゲーム専用コンポーネント
  components: {
    CharacterDialog,
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

