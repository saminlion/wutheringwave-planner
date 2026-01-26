/**
 * Endfield Game Configuration
 */
export default {
  id: 'endfield',
  name: 'Endfield',
  displayName: 'Endfield',

  // Theme colors for gradient styling
  themeColors: {
    rarity: {
      3: '#3b82f680',  // Blue
      4: '#6B60B5',    // Purple
      5: '#DAA520',    // Gold
      6: '#FF8C00',    // Orange
    },
    element: {
      physical: '#808080',
      heat: '#FF5E5E',
      cryo: '#74D4FF',
      electric: '#C082FF',
      nature: '#53FFC8',
    },
  },

  // Game-specific constants
  constants: {
    MAX_LEVEL: 90,
    MAX_SKILL_LEVEL: 9,
    MAX_MASTERY_LEVEL: 3,
    MAX_SPECIAL_LEVEL: 2,
    MAX_INFRA_LEVEL: 2,
    SYNTHESIS_RATIO: null, // Endfield uses recipe-based synthesis (not simple 3:1)
  },

  // Filter options for UI
  filters: {
    // Elements TBD - placeholder for now
    elements: [
      { value: 'all', label: 'All' },
      // TODO: Add Endfield elements when confirmed
    ],
    weaponTypes: [
      { value: 'all', label: 'All' },
      { value: 'one_handed_sword', label: 'One-Handed Sword' },
      { value: 'two_handed_sword', label: 'Two-Handed Sword' },
      { value: 'polearm', label: 'Polearm' },
      { value: 'arts', label: 'Arts' },
      { value: 'pistol', label: 'Pistol' },
    ],
    characterRarities: [
      { value: 'all', label: 'All' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
      { value: '6', label: '6' },
    ],
    weaponRarities: [
      { value: 'all', label: 'All' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
      { value: '6', label: '6' },
    ],
  },

  // Form fields for dialogs
  formFields: {
    // Endfield ascension system (costs.json 기준)
    characterLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '40', label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '60', label: 'Level 60' },
      { value: '60A', label: 'Level 60 Ascended' },
      { value: '70', label: 'Level 70' },
      { value: '80', label: 'Level 80' },
      { value: '90', label: 'Level 90' },
    ],
    weaponLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
      { value: '40', label: 'Level 40' },
      { value: '40A', label: 'Level 40 Ascended' },
      { value: '60', label: 'Level 60' },
      { value: '60A', label: 'Level 60 Ascended' },
      { value: '80', label: 'Level 80' },
      { value: '80A', label: 'Level 80 Ascended' },
      { value: '90', label: 'Level 90' },
    ],
    // Endfield 스킬 시스템 (WW와 다름)
    // Combat Skills 4개: 레벨 1~9 + 마스터리 1~3
    characterSkills: [
      { label: 'Basic Attack', model_value: 'basic_attack', maxLevel: 9, hasMastery: true, maxMasteryLevel: 3 },
      { label: 'Battle Skill', model_value: 'battle_skill', maxLevel: 9, hasMastery: true, maxMasteryLevel: 3 },
      { label: 'Combo Skill', model_value: 'combo_skill', maxLevel: 9, hasMastery: true, maxMasteryLevel: 3 },
      { label: 'Ultimate', model_value: 'ultimate', maxLevel: 9, hasMastery: true, maxMasteryLevel: 3 },
    ],
    // Talent (스페셜) 2개: 레벨 1~2
    characterSpecial: [
      { label: 'Talent 1', model_value: 'talent_1', maxLevel: 2 },
      { label: 'Talent 2', model_value: 'talent_2', maxLevel: 2 },
    ],
    // Base Skill 2개: 레벨 1~2
    characterBaseSkill: [
      { label: 'Base Skill 1', model_value: 'base_skill_1', maxLevel: 2 },
      { label: 'Base Skill 2', model_value: 'base_skill_2', maxLevel: 2 },
    ],
    // Attribute Increase (텔런트) 4개: 단계 없음 (언락만)
    characterAttributes: [
      { label: 'Attribute 1', model_value: 'attribute_1' },
      { label: 'Attribute 2', model_value: 'attribute_2' },
      { label: 'Attribute 3', model_value: 'attribute_3' },
      { label: 'Attribute 4', model_value: 'attribute_4' },
    ],
    // WW 호환용 (빈 배열) - CharacterView가 참조할 수 있음
    characterActiveSkills: [],
    characterPassiveSkills: {},
  },

  // Stamina system configuration
  stamina: {
    name: 'Sanity',
    dailyLimit: 240,
    defaultDungeonLevel: 5,  // 기본 던전 레벨 설정
    // farmingRates는 동적으로 계산됨 (getDungeonRates 메서드 사용)
    farmingRates: {
      credit: { drops: 34000, stamina: 80 },       // Lv.5 기본값
      player_exp: { drops: 170000, stamina: 80 },  // Lv.5 기본값
      weapon_exp: { drops: 170000, stamina: 80 },  // Lv.5 기본값
      common: { drops: 0, stamina: 0, unobtainable: true },  // Endfield에서 사용 안 함
      ascension: { drops: 0, stamina: 0, unobtainable: true },  // bolete/odendra/onyx - 필드 파밍
      forgery: { drops: 85, stamina: 80 },         // Lv.5 proto_skill tier2 기본값
      boss: { drops: 0, stamina: 0, unobtainable: true },
      weeklyBoss: { drops: 0, stamina: 0, unobtainable: true },
    },
  },

  // 던전 레벨별 상세 데이터 (Lv.1~5)
  dungeonData: {
    // Proto 던전 (캐릭터 돌파용 proto_asc)
    proto_asc: {
      1: { stamina: 40, tier2: 8 },
      2: { stamina: 50, tier2: 14 },
      3: { stamina: 60, tier2: 20, tier3: 8 },
      4: { stamina: 70, tier2: 27, tier3: 11 },
      5: { stamina: 80, tier2: 34, tier3: 14 },
    },
    // Proto 던전 (스킬용 proto_skill)
    proto_skill: {
      1: { stamina: 40, tier2: 21 },
      2: { stamina: 50, tier2: 35 },
      3: { stamina: 60, tier2: 50, tier3: 10 },
      4: { stamina: 70, tier2: 69, tier3: 14 },
      5: { stamina: 80, tier2: 85, tier3: 17 },
    },
    // Cast Die 던전 (무기 돌파용)
    cast_die: {
      1: { stamina: 40, tier2: 8 },
      2: { stamina: 50, tier2: 14 },
      3: { stamina: 60, tier2: 20, tier3: 8 },
      4: { stamina: 70, tier2: 27, tier3: 11 },
      5: { stamina: 80, tier2: 34, tier3: 14 },
    },
    // Credit 던전
    credit: {
      1: { stamina: 40, drops: 8500 },
      2: { stamina: 50, drops: 13500 },
      3: { stamina: 60, drops: 19500 },
      4: { stamina: 70, drops: 27500 },
      5: { stamina: 80, drops: 34000 },
    },
    // 캐릭터 EXP 던전 (Combat Record / Cognitive Carrier)
    // Lv.3부터 61-90용 Cognitive Carrier 선택 가능
    player_exp: {
      1: { stamina: 40, totalExp: 44200 },   // 4×10000 + 2×1000 + 3×200
      2: { stamina: 50, totalExp: 70400 },   // 6×10000 + 9×1000 + 4×200
      3: { stamina: 60, totalExp: 99800 },   // 9×10000 + 9×1000 + 4×200
      4: { stamina: 70, totalExp: 137600 },  // 13×10000 + 7×1000 + 2×200
      5: { stamina: 80, totalExp: 170000 },  // 17×10000
    },
    // 무기 EXP 던전
    weapon_exp: {
      1: { stamina: 40, totalExp: 48000 },   // 4×10000 + 6×1000 + 7×200
      2: { stamina: 50, totalExp: 70400 },   // 6×10000 + 9×1000 + 4×200
      3: { stamina: 60, totalExp: 99200 },   // 9×10000 + 9×1000 + 1×200
      4: { stamina: 70, totalExp: 139400 },  // 12×10000 + 16×1000 + 7×200
      5: { stamina: 80, totalExp: 170000 },  // 16×10000 + 10×1000
    },
  },

  /**
   * 지정된 던전 레벨에 따른 farmingRates 반환
   * @param {number} level - 던전 레벨 (1~5)
   * @returns {object} farmingRates 객체
   */
  getDungeonRates(level = 5) {
    const dungeonData = this.dungeonData;
    const lv = Math.max(1, Math.min(5, level));

    return {
      credit: {
        drops: dungeonData.credit[lv].drops,
        stamina: dungeonData.credit[lv].stamina,
      },
      player_exp: {
        drops: dungeonData.player_exp[lv].totalExp,
        stamina: dungeonData.player_exp[lv].stamina,
      },
      weapon_exp: {
        drops: dungeonData.weapon_exp[lv].totalExp,
        stamina: dungeonData.weapon_exp[lv].stamina,
      },
      common: { drops: 0, stamina: 0, unobtainable: true },
      ascension: { drops: 0, stamina: 0, unobtainable: true },
      // forgery는 tier별로 분리하여 반환
      forgery: {
        stamina: dungeonData.proto_skill[lv].stamina,
        tier2: dungeonData.proto_skill[lv].tier2,
        tier3: dungeonData.proto_skill[lv].tier3 || 0,
        hasTierChoice: lv >= 3,  // Lv.3부터 티어 선택 가능
      },
      boss: { drops: 0, stamina: 0, unobtainable: true },
      weeklyBoss: { drops: 0, stamina: 0, unobtainable: true },
    };
  },

  /**
   * SubCategory별 던전 데이터 반환
   * @param {string} subCategory - proto_asc, proto_skill, cast_die
   * @param {number} level - 던전 레벨 (1~5)
   * @returns {object} 해당 던전의 stamina/drops 데이터
   */
  getDungeonDataBySubCategory(subCategory, level = 5) {
    const dungeonData = this.dungeonData;
    const lv = Math.max(1, Math.min(5, level));

    if (dungeonData[subCategory] && dungeonData[subCategory][lv]) {
      return {
        ...dungeonData[subCategory][lv],
        hasTierChoice: lv >= 3 && dungeonData[subCategory][lv].tier3 !== undefined,
      };
    }

    return null;
  },

  // Material categories specific to Endfield
  materialCategories: {
    credit: 'Credit',
    common: 'Common Materials',
    forgery: 'Skill Materials',
    ascension: 'Ascension Materials',
    boss: 'Boss Materials',
    weeklyBoss: 'Weekly Boss Materials',
    player_exp: 'Player EXP',
    weapon_exp: 'Weapon EXP',
  },

  // Level progression format
  levelFormat: {
    ascension: true,
    maxLevel: 90,
    ascensionLevels: [40, 60, 80, 90], // 7-stage ascension at these levels
  },

  // Feature flags
  features: {
    synthesis: true,
    synthesisType: 'recipe', // 'recipe' (mixing) vs 'tier' (3:1 upgrade)
    passiveSkills: true,
    weaponProgression: true,
  },

  // UI handlers - ゲーム固有のUI表示条件を定義
  uiHandlers: {
    /**
     * ダンジョンレベル選択UIを表示するか
     */
    showDungeonLevelSelector: true,

    /**
     * ダンジョンレベルの選択肢を返す
     * @returns {number[]} レベル配列
     */
    getDungeonLevelOptions() {
      return [1, 2, 3, 4, 5];
    },

    /**
     * カテゴリ別にティア分離Estimated表示を使うか
     * @param {object} category - カテゴリオブジェクト
     * @returns {boolean}
     */
    useTierSeparatedEstimates(category) {
      return category.name === 'forgery';
    },

    /**
     * 動的farmingRatesを使用するか
     */
    useDynamicFarmingRates: true,
  },

  /**
   * キャラクター設定の初期値を生成
   * @returns {object} 初期設定オブジェクト
   */
  createCharacterInitialSettings() {
    const skills = this.formFields.characterSkills;
    const special = this.formFields.characterSpecial;
    const baseSkill = this.formFields.characterBaseSkill;
    const attributes = this.formFields.characterAttributes;

    // Combat Skills 초기화 (level + mastery)
    const skillsSettings = skills.reduce((acc, skill) => {
      acc[skill.model_value] = {
        current_level: 1,
        target_level: 1,
        current_mastery: 0,
        target_mastery: 0,
      };
      return acc;
    }, {});

    // Talent (Special) 초기화
    const specialSettings = special.reduce((acc, skill) => {
      acc[skill.model_value] = {
        current_level: 0,
        target_level: 0,
      };
      return acc;
    }, {});

    // Base Skill 초기화
    const baseSkillSettings = baseSkill.reduce((acc, skill) => {
      acc[skill.model_value] = {
        current_level: 0,
        target_level: 0,
      };
      return acc;
    }, {});

    // Attributes 초기화 (boolean)
    const attributesSettings = attributes.reduce((acc, attr) => {
      acc[attr.model_value] = false;
      return acc;
    }, {});

    return {
      currentLevel: '1',
      targetLevel: '1',
      skills: skillsSettings,
      special: specialSettings,
      baseSkill: baseSkillSettings,
      attributes: attributesSettings,
    };
  },
};
