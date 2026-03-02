/**
 * GFL2 (Girls' Frontline 2: Exilium) Game Plugin Entry Point
 */
import config from './config.js';
import {
  characters,
  weapons,
  materials,
  costs,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data/index.js';

// Game-specific components
import CharacterDialog from './components/CharacterDialog.vue';

// Game-specific material processor
import * as materialProcessor from './materialProcessor.js';

// Enrich characters with rarity-specific passive_costs for passive skill calculation
const enrichedCharacters = Object.fromEntries(
  Object.entries(characters).map(([id, char]) => {
    const passiveCosts = costs.character?.passive?.[String(char.rarity)];
    if (passiveCosts) {
      return [id, { ...char, passive_costs: passiveCosts }];
    }
    return [id, char];
  }),
);

const dataCache = {
  characters: enrichedCharacters,
  weapons,
  materials,
  costs,
  tiers: tieredMaterials,
};

const gfl2Plugin = {
  id: 'gfl2',
  name: "Girls' Frontline 2: Exilium",
  displayName: 'GFL2',
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
      tierLevels: 7,
    },
  },
  costs,
  data: {
    characters: enrichedCharacters,
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

export default gfl2Plugin;
