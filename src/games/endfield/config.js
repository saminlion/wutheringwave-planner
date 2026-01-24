/**
 * Endfield Game Configuration
 */
export default {
  id: 'endfield',
  name: 'Endfield',
  displayName: 'Endfield',

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
    // Endfield uses 7-stage ascension system
    // 40A1 (material), 40A2 (credit only), 60A3 (material), 60A4 (credit only), etc.
    characterLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '40', label: 'Level 40' },
      { value: '40A1', label: 'Level 40 Ascended 1' },
      { value: '40A2', label: 'Level 40 Ascended 2' },
      { value: '60', label: 'Level 60' },
      { value: '60A3', label: 'Level 60 Ascended 3' },
      { value: '60A4', label: 'Level 60 Ascended 4' },
      { value: '80', label: 'Level 80' },
      { value: '80A5', label: 'Level 80 Ascended 5' },
      { value: '80A6', label: 'Level 80 Ascended 6' },
      { value: '90', label: 'Level 90' },
      { value: '90A7', label: 'Level 90 Ascended 7' },
    ],
    weaponLevelItems: [
      { value: '1', label: 'Level 1' },
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
    // Farming rates per category: drops per run, stamina cost per run
    // TODO: Update with actual Endfield values when available
    farmingRates: {
      credit: { drops: 80000, stamina: 40 },
      player_exp: { drops: 70000, stamina: 40 },
      weapon_exp: { drops: 70000, stamina: 40 },
      common: { drops: 0, stamina: 0, unobtainable: true },
      ascension: { drops: 0, stamina: 0, unobtainable: true },
      forgery: { drops: 50, stamina: 40 },
      boss: { drops: 4, stamina: 60 },
      weeklyBoss: { drops: 3, stamina: 60 },
    },
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
