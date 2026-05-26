import { characters, weapons, materials, costs, farmingRates, tieredMaterials, tieredMaterialsByGameId } from './data';

export const mongilstardiveConfig = {
  id: 'mongilstardive',
  name: 'Mongil StarDive',
  shortName: 'MSD',
  version: '1.0.0',

  themeColors: {
    rarity: {
      3: '#3b82f680',
      4: '#6B60B5',
      5: '#FFD700',
    },
    element: {
      fire:      '#FF4500',
      ice:       '#60BFFF',
      wind:      '#66CC88',
      lightning: '#CC88FF',
      earth:     '#CC8844',
    },
  },

  filters: {
    elements: [
      { value: 'all',       label: 'All' },
      { value: 'fire',      label: 'Fire' },
      { value: 'ice',       label: 'Ice' },
      { value: 'wind',      label: 'Wind' },
      { value: 'lightning', label: 'Lightning' },
      { value: 'earth',     label: 'Earth' },
    ],
    weaponTypes: [
      { value: 'all',       label: 'All' },
      { value: 'brawler',   label: 'Brawler' },
      { value: 'destroyer', label: 'Destroyer' },
      { value: 'slayer',    label: 'Slayer' },
      { value: 'supporter', label: 'Supporter' },
    ],
    characterRarities: [
      { value: 'all', label: 'All' },
      { value: '4',   label: '4' },
      { value: '5',   label: '5' },
    ],
    weaponRarities: [
      { value: 'all', label: 'All' },
      { value: '3',   label: '3' },
      { value: '4',   label: '4' },
      { value: '5',   label: '5' },
    ],
  },

  formFields: {
    characterLevelItems: [
      { value: '1',   label: 'Level 1' },
      { value: '20',  label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '30',  label: 'Level 30' },
      { value: '30A', label: 'Level 30 Ascended' },
      { value: '40',  label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '50',  label: 'Level 50' },
      { value: '50A', label: 'Level 50 Ascended' },
      { value: '60',  label: 'Level 60' },
    ],
    weaponLevelItems: [
      { value: '1',   label: 'Level 1' },
      { value: '20',  label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '30',  label: 'Level 30' },
      { value: '30A', label: 'Level 30 Ascended' },
      { value: '40',  label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '50',  label: 'Level 50' },
      { value: '50A', label: 'Level 50 Ascended' },
      { value: '60',  label: 'Level 60' },
    ],
    characterActiveSkills: [
      { label: 'Skill',         model_value: 'skill' },
      { label: 'Normal Attack', model_value: 'normal_attack' },
      { label: 'Tag-In Skill',  model_value: 'tagin_skill' },
      { label: 'Ultimate',      model_value: 'ultimate' },
    ],
    characterPassiveSkills: [],
    skillMaxLevel: 12,
  },

  stamina: {
    name: 'Key',
    dailyLimit: 100,
    farmingRates,
  },

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

  uiHandlers: {
    showDungeonLevelSelector: false,
    getDungeonLevelOptions() { return []; },
    useTierSeparatedEstimates() { return false; },
    useDynamicFarmingRates: false,
  },

  createCharacterInitialSettings() {
    const activeSkills = this.formFields.characterActiveSkills;
    const activeSkillsSettings = activeSkills.reduce((acc, skill) => {
      acc[`${skill.model_value}_current_level`] = 1;
      acc[`${skill.model_value}_target_level`] = 1;
      return acc;
    }, {});
    return {
      currentLevel: '1',
      targetLevel: '1',
      activeSkills: activeSkillsSettings,
      passiveSkills: {},
    };
  },
};

export default mongilstardiveConfig;
