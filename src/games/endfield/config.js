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
    MAX_SKILL_LEVEL: 10,
    SYNTHESIS_RATIO: null, // Endfield uses recipe-based synthesis (not simple 3:1)
    DAILY_STAMINA: 240,
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

  // Level progression format (same as Wuthering Waves)
  // 1~20: base, 20~40: 1st ascension, 40~60: 2nd ascension, 60~80: 3rd ascension, 80~90: 4th ascension
  levelFormat: {
    ascension: true,
    maxLevel: 90,
    ascensionLevels: [20, 40, 60, 80], // Ascension at 20, 40, 60, 80
    // Available levels: 1, 20, 20A, 40, 40A, 60, 60A, 80, 80A, 90
  },

  // Feature flags
  features: {
    synthesis: true,
    synthesisType: 'recipe', // 'recipe' (1:3:1 mixing) vs 'tier' (3:1 upgrade)
    passiveSkills: false, // TBD - not yet confirmed if passive skills exist
    weaponProgression: true,
  },
};
