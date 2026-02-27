import {
  characters,
  weapons,
  materials,
  costs,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data';

export const gfl2Config = {
  id: 'gfl2',
  name: "Girls' Frontline 2: Exilium",
  shortName: 'GFL2',
  version: '1.0.0',

  themeColors: {
    rarity: {
      3: '#3b82f680',
      4: '#6B60B5',
      5: '#C88844',
    },
    element: {
      burn: '#FF7043',
      corrosion: '#CE93D8',
      electric: '#FFD54F',
      freeze: '#80DEEA',
      hydro: '#4FC3F7',
      physical: '#BDBDBD',
    },
  },

  filters: {
    elements: [
      { value: 'all', label: 'All' },
      { value: 'burn', label: 'Burn' },
      { value: 'corrosion', label: 'Corrosion' },
      { value: 'electric', label: 'Electric' },
      { value: 'freeze', label: 'Freeze' },
      { value: 'hydro', label: 'Hydro' },
      { value: 'physical', label: 'Physical' },
    ],
    weaponTypes: [
      { value: 'all', label: 'All' },
      { value: 'hg', label: 'HG' },
      { value: 'ar', label: 'AR' },
      { value: 'rf', label: 'RF' },
      { value: 'sg', label: 'SG' },
      { value: 'smg', label: 'SMG' },
      { value: 'bld', label: 'Blade' },
    ],
    characterRarities: [
      { value: 'all', label: 'All' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
    ],
    weaponRarities: [
      { value: 'all', label: 'All' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
    ],
  },

  formFields: {
    characterLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '30', label: 'Level 30' },
      { value: '30A', label: 'Level 30 Ascended' },
      { value: '40', label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '50', label: 'Level 50' },
      { value: '50A', label: 'Level 50 Ascended' },
      { value: '60', label: 'Level 60' },
    ],
    weaponLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '10', label: 'Level 10' },
      { value: '20', label: 'Level 20' },
      { value: '30', label: 'Level 30' },
      { value: '40', label: 'Level 40' },
      { value: '50', label: 'Level 50' },
      { value: '60', label: 'Level 60' },
    ],
    // GFL2 has no active skills
    characterActiveSkills: [],
    characterPassiveSkills: {},
    // GFL2 uses Endfield-style special (passives) and attributes (bonus stats)
    characterSkills: [],
    characterSpecial: [
      { label: 'Passive 1', model_value: 'passive_1', maxLevel: 1 },
      { label: 'Passive 2', model_value: 'passive_2', maxLevel: 1 },
      { label: 'Passive 3', model_value: 'passive_3', maxLevel: 1 },
      { label: 'Passive 4', model_value: 'passive_4', maxLevel: 1 },
      { label: 'Passive 5', model_value: 'passive_5', maxLevel: 1 },
      { label: 'Passive 6', model_value: 'passive_6', maxLevel: 1 },
    ],
    characterBaseSkill: [],
    characterAttributes: [
      { label: 'Bonus Stat 1', model_value: 'attribute_1' },
      { label: 'Bonus Stat 2', model_value: 'attribute_2' },
      { label: 'Bonus Stat 3', model_value: 'attribute_3' },
      { label: 'Bonus Stat 4', model_value: 'attribute_4' },
      { label: 'Bonus Stat 5', model_value: 'attribute_5' },
      { label: 'Bonus Stat 6', model_value: 'attribute_6' },
    ],
  },

  stamina: {
    name: 'Intelligence Puzzle',
    dailyLimit: 240,
    farmingRates: {
      credit: { drops: 0, stamina: 0, unobtainable: true },
      doll_exp: { drops: 0, stamina: 0, unobtainable: true },
      weapon_exp: { drops: 0, stamina: 0, unobtainable: true },
      forgery: { drops: 0, stamina: 0, unobtainable: true },
      rare_material: { drops: 0, stamina: 0, unobtainable: true },
    },
  },

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
    characters,
    weapons,
  },

  uiHandlers: {
    showDungeonLevelSelector: false,
    getDungeonLevelOptions() { return []; },
    useTierSeparatedEstimates() { return false; },
    useDynamicFarmingRates: false,
  },

  createCharacterInitialSettings() {
    const special = this.formFields.characterSpecial;
    const attributes = this.formFields.characterAttributes;

    // Passives as special (0→1 level range)
    const specialSettings = special.reduce((acc, skill) => {
      acc[skill.model_value] = {
        current_level: 0,
        target_level: 0,
      };
      return acc;
    }, {});

    // Bonus stats as attributes (checkboxes)
    const attributesSettings = attributes.reduce((acc, attr) => {
      acc[attr.model_value] = false;
      return acc;
    }, {});

    return {
      currentLevel: '1',
      targetLevel: '1',
      special: specialSettings,
      attributes: attributesSettings,
    };
  },
};

export default gfl2Config;
