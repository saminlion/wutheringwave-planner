import {
  characters,
  weapons,
  materials,
  costs,
  farmingRates,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data';

export const nteConfig = {
  id: 'nte',
  name: 'Neverness To Everness',
  shortName: 'NTE',
  version: '1.0.0',

  themeColors: {
    rarity: {
      3: '#3b82f680',
      4: '#6B60B5',
      6: '#FFD700',
    },
    element: {
      incantation: '#E04778',
      anima: '#38C297',
      cosmos: '#D2CCA9',
      psyche: '#6A71F4',
      lakshana: '#DDCB68',
      chaos: '#A36EDB',
    },
  },

  filters: {
    elements: [
      { value: 'all', label: 'All' },
      { value: 'incantation', label: 'Incantation' },
      { value: 'anima', label: 'Anima' },
      { value: 'cosmos', label: 'Cosmos' },
      { value: 'psyche', label: 'Psyche' },
      { value: 'lakshana', label: 'Lakshana' },
      { value: 'chaos', label: 'Chaos' },
    ],
    weaponTypes: [
      { value: 'all', label: 'All' },
      { value: 'synthesis', label: 'Synthesis' },
      { value: 'gas', label: 'Gas' },
      { value: 'liquid', label: 'Liquid' },
      { value: 'solid', label: 'Solid' },
      { value: 'plasma', label: 'Plasma' },
    ],
    characterRarities: [
      { value: 'all', label: 'All' },
      { value: '4', label: 'A' },
      { value: '6', label: 'S' },
    ],
    weaponRarities: [
      { value: 'all', label: 'All' },
      { value: '3', label: 'B' },
      { value: '4', label: 'A' },
      { value: '6', label: 'S' },
    ],
  },

  formFields: {
    // Level ceiling is limited to available cost data.
    // Expand as more data is confirmed in COSTS_DATA.md.
    characterLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '30', label: 'Level 30' },
      { value: '30A', label: 'Level 30 Ascended' },
      { value: '40', label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '50A', label: 'Level 50 Ascended' },
      { value: '60A', label: 'Level 60 Ascended' },
      { value: '70A', label: 'Level 70 Ascended' },
    ],
    weaponLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '30', label: 'Level 30' },
      { value: '30A', label: 'Level 30 Ascended' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '50A', label: 'Level 50 Ascended' },
      { value: '60A', label: 'Level 60 Ascended' },
      { value: '70A', label: 'Level 70 Ascended' },
    ],
    characterActiveSkills: [
      { label: 'Normal Attack', model_value: 'normal_attack' },
      { label: 'Byrail Skill', model_value: 'byrail_skill' },
      { label: 'Ultimate', model_value: 'ultimate' },
      { label: 'Support Skill', model_value: 'support_skill' },
    ],
    // Passive skills are 1-time unlock (0 = locked, 1 = unlocked)
    characterPassiveSkills: [
      { label: 'Passive 1', model_value: 'passive_1', min: 0, max: 1 },
      { label: 'Passive 2', model_value: 'passive_2', min: 0, max: 1 },
    ],
  },

  stamina: {
    name: 'Character Pixel',
    dailyLimit: 240,
    farmingRates,
  },

  materials: {
    database: materials,
    tiers: tieredMaterials,
    tiersByGameId: tieredMaterialsByGameId,
    synthesis: {
      ratio: 3,
      tierLevels: 3,
      supportsDecomposition: true,
    },
  },
  costs,
  data: {
    characters,
    weapons,
  },

  uiHandlers: {
    showDungeonLevelSelector: false,
    getDungeonLevelOptions() {
      return [];
    },
    useTierSeparatedEstimates(category) {
      return false;
    },
    useDynamicFarmingRates: false,
  },

  createCharacterInitialSettings() {
    const activeSkills = this.formFields.characterActiveSkills;
    const passiveSkills = this.formFields.characterPassiveSkills;

    const activeSkillsSettings = activeSkills.reduce((acc, skill) => {
      acc[`${skill.model_value}_current_level`] = 1;
      acc[`${skill.model_value}_target_level`] = 1;
      return acc;
    }, {});

    const passiveSkillsSettings = passiveSkills.reduce((acc, skill) => {
      acc[`${skill.model_value}_current_level`] = skill.min ?? 0;
      acc[`${skill.model_value}_target_level`] = skill.min ?? 0;
      return acc;
    }, {});

    return {
      currentLevel: '1',
      targetLevel: '1',
      activeSkills: activeSkillsSettings,
      passiveSkills: passiveSkillsSettings,
    };
  },
};

export default nteConfig;
