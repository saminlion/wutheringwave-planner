import {
  characters,
  weapons,
  materials,
  costs,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data';

/**
 * 한국어 주석: Wuthering Waves 전용 플러그인 설정.
 * 추후 게임 레지스트리에서 이 설정을 로드해 코어 엔진에 주입한다.
 */
export const wutheringWaveConfig = {
  id: 'wutheringwave',
  name: 'Wuthering Waves',
  shortName: 'WW',
  version: '1.0.0',

  // Theme colors for gradient styling
  themeColors: {
    rarity: {
      3: '#3b82f680',
      4: '#6B60B5',
      5: '#C88844',
    },
    element: {
      glacio: '#74D4FF',
      fusion: '#FF5E5E',
      electro: '#C082FF',
      aero: '#53FFC8',
      spectro: '#FFD700',
      havoc: '#FF6AC1',
    },
  },

  // Filter options for UI
  filters: {
    elements: [
      { value: 'all', label: 'All' },
      { value: 'glacio', label: 'Glacio' },
      { value: 'fusion', label: 'Fusion' },
      { value: 'aero', label: 'Aero' },
      { value: 'electro', label: 'Electro' },
      { value: 'havoc', label: 'Havoc' },
      { value: 'spectro', label: 'Spectro' },
    ],
    weaponTypes: [
      { value: 'all', label: 'All' },
      { value: 'sword', label: 'Sword' },
      { value: 'pistols', label: 'Pistols' },
      { value: 'rectifier', label: 'Rectifier' },
      { value: 'gauntlets', label: 'Gauntlets' },
      { value: 'broadblade', label: 'Broadblade' },
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

  // Form fields for dialogs
  formFields: {
    characterLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '40', label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '50', label: 'Level 50' },
      { value: '50A', label: 'Level 50 Ascended' },
      { value: '60', label: 'Level 60' },
      { value: '60A', label: 'Level 60 Ascended' },
      { value: '70', label: 'Level 70' },
      { value: '70A', label: 'Level 70 Ascended' },
      { value: '80', label: 'Level 80' },
      { value: '80A', label: 'Level 80 Ascended' },
      { value: '90', label: 'Level 90' },
    ],
    weaponLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '40', label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '50', label: 'Level 50' },
      { value: '50A', label: 'Level 50 Ascended' },
      { value: '60', label: 'Level 60' },
      { value: '60A', label: 'Level 60 Ascended' },
      { value: '70', label: 'Level 70' },
      { value: '70A', label: 'Level 70 Ascended' },
      { value: '80', label: 'Level 80' },
      { value: '80A', label: 'Level 80 Ascended' },
      { value: '90', label: 'Level 90' },
    ],
    characterActiveSkills: [
      { label: 'Primary Attack', model_value: 'primary_attack' },
      { label: 'Special Ability', model_value: 'special_ability' },
      { label: 'Ultimate Move', model_value: 'ultimate_move' },
      { label: 'Support Skill', model_value: 'support_skill' },
      { label: 'Enhanced Mode', model_value: 'enhanced_mode' },
    ],
    characterPassiveSkills: [
      { label: 'Passive Ability', model_value: 'passive_ability', min: 0, max: 2 },
      { label: 'Bonus Stat 1', model_value: 'bonus_stat_1', min: 0, max: 2 },
      { label: 'Bonus Stat 2', model_value: 'bonus_stat_2', min: 0, max: 2 },
      { label: 'Bonus Stat 3', model_value: 'bonus_stat_3', min: 0, max: 2 },
      { label: 'Bonus Stat 4', model_value: 'bonus_stat_4', min: 0, max: 2 },
    ],
  },

  // Stamina system configuration
  stamina: {
    name: 'Waveplates',
    dailyLimit: 240,
    // Farming rates per category: drops per run, stamina cost per run
    farmingRates: {
      credit: { drops: 84000, stamina: 40 },
      player_exp: { drops: 76000, stamina: 40 },
      weapon_exp: { drops: 76000, stamina: 40 },
      common: { drops: 0, stamina: 0, unobtainable: true },
      ascension: { drops: 0, stamina: 0, unobtainable: true },
      forgery: { drops: 51, stamina: 40 },
      boss: { drops: 4.3, stamina: 60 },
      weekly: { drops: 3, stamina: 60 },  // materials.jsonのCategory名に合わせる
    },
  },

  materials: {
    database: materials,
    tiers: tieredMaterials,
    tiersByGameId: tieredMaterialsByGameId,
    synthesis: {
      ratio: 3,
      tierLevels: 4,
    },
  },
  costs,
  data: {
    characters,
    weapons,
  },

  // UI handlers - ゲーム固有のUI表示条件を定義
  uiHandlers: {
    /**
     * ダンジョンレベル選択UIを表示するか
     */
    showDungeonLevelSelector: false,

    /**
     * ダンジョンレベルの選択肢を返す
     * @returns {number[]} レベル配列
     */
    getDungeonLevelOptions() {
      return [];
    },

    /**
     * カテゴリ別にティア分離Estimated表示を使うか
     * @param {object} category - カテゴリオブジェクト
     * @returns {boolean}
     */
    useTierSeparatedEstimates(category) {
      return false;
    },

    /**
     * 動的farmingRatesを使用するか
     */
    useDynamicFarmingRates: false,
  },

  /**
   * キャラクター設定の初期値を生成
   * @returns {object} 初期設定オブジェクト
   */
  createCharacterInitialSettings() {
    const activeSkills = this.formFields.characterActiveSkills;
    const passiveSkills = this.formFields.characterPassiveSkills;

    // Active skills 초기화
    const activeSkillsSettings = activeSkills.reduce((acc, skill) => {
      acc[`${skill.model_value}_current_level`] = 1;
      acc[`${skill.model_value}_target_level`] = 1;
      return acc;
    }, {});

    // Passive skills 초기화 (레벨 기반: current/target)
    const passiveSkillsSettings = passiveSkills.reduce((acc, skill) => {
      acc[`${skill.model_value}_current_level`] = skill.min || 0;
      acc[`${skill.model_value}_target_level`] = skill.min || 0;
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

export default wutheringWaveConfig;
