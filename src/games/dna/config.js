import {
  characters,
  weapons,
  materials,
  costs,
  farmingRates,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data';

/**
 * Duet Night Abyss plugin config.
 *
 * Two deliberate departures from the other games:
 *
 * `stamina: null` — DNA has no stamina resource. Progress comes from repeating
 * commissions, and quitting mid-run forfeits the run's rewards, so the only
 * meaningful unit of effort is "one completed session". Every stamina-facing UI
 * is guarded on `config.stamina` being present, so nulling it hides the daily
 * limit setting and the stamina/days summary while leaving run counts intact.
 *
 * Level dropdowns stop where verified cost data stops (character 70A, weapon
 * 60A). Offering a higher target would silently under-count EXP for the
 * unmeasured band rather than warn about it.
 */
export const dnaConfig = {
  id: 'dna',
  name: 'Duet Night Abyss',
  shortName: 'DNA',
  version: '1.0.0',

  themeColors: {
    rarity: {
      4: '#6B60B5',
      5: '#C88844',
    },
    // Mirrors the `color` column of the sheet's Lookup tab
    element: {
      anemo: '#6EE7B7',
      electro: '#C084FC',
      hydro: '#38BDF8',
      lumino: '#FDE68A',
      pyro: '#FB7185',
      umbro: '#818CF8',
    },
  },

  filters: {
    elements: [
      { value: 'all', label: 'All' },
      { value: 'anemo', label: 'Anemo' },
      { value: 'electro', label: 'Electro' },
      { value: 'hydro', label: 'Hydro' },
      { value: 'lumino', label: 'Lumino' },
      { value: 'pyro', label: 'Pyro' },
      { value: 'umbro', label: 'Umbro' },
    ],
    weaponTypes: [
      { value: 'all', label: 'All' },
      // Melee
      { value: 'dual_blades', label: 'Dual Blades' },
      { value: 'greatsword', label: 'Greatsword' },
      { value: 'katana', label: 'Katana' },
      { value: 'polearm', label: 'Polearm' },
      { value: 'sword', label: 'Sword' },
      { value: 'whipblade', label: 'Whipblade' },
      // Ranged
      { value: 'assault_rifle', label: 'Assault Rifle' },
      { value: 'bow', label: 'Bow' },
      { value: 'dual_pistols', label: 'Dual Pistols' },
      { value: 'grenade_launcher', label: 'Grenade Launcher' },
      { value: 'pistol', label: 'Pistol' },
      { value: 'shotgun', label: 'Shotgun' },
    ],
    characterRarities: [
      { value: 'all', label: 'All' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
    ],
    weaponRarities: [
      { value: 'all', label: 'All' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
    ],
  },

  formFields: {
    // Ascensions at 20/30/40/50/60/70. Stops at 70A: the 70→80 EXP band is
    // not yet measured, so offering 80 would under-count.
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
      { value: '60A', label: 'Level 60 Ascended' },
      { value: '70', label: 'Level 70' },
      { value: '70A', label: 'Level 70 Ascended' },
    ],
    // Stops at 60A for the same reason — weapon EXP is only known to Lv60.
    // The 70A ascension cost IS in costs.json and becomes reachable as soon as
    // the 60→70 EXP band is filled in.
    weaponLevelItems: [
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
      { value: '60A', label: 'Level 60 Ascended' },
    ],
    // Three levelable skills, Lv1→10, identical cost table each.
    characterActiveSkills: [
      { label: 'Core Skill', model_value: 'core_skill' },
      { label: 'Ultimate', model_value: 'ultimate' },
      { label: 'Passive Skill', model_value: 'passive_skill' },
    ],
    // Six one-shot unlocks. Not levels — each is off/on (0 → 1), which the
    // engine reads as a flat cost at costs.character.passive[model_value].
    // model_value must start with "passive_" for that path to trigger.
    characterPassiveSkills: [
      { label: 'Passive 1', model_value: 'passive_1', min: 0, max: 1 },
      { label: 'Core Talent 1', model_value: 'passive_2', min: 0, max: 1 },
      { label: 'Ultimate Talent 1', model_value: 'passive_3', min: 0, max: 1 },
      { label: 'Passive 2', model_value: 'passive_4', min: 0, max: 1 },
      { label: 'Core Talent 2', model_value: 'passive_5', min: 0, max: 1 },
      { label: 'Ultimate Talent 2', model_value: 'passive_6', min: 0, max: 1 },
    ],
  },

  // No stamina system — see the note at the top of this file.
  stamina: null,

  // Run-based farming rates, kept separately so the planner can still show
  // "estimated runs" without a stamina cost per run.
  farmingRates,

  materials: {
    database: materials,
    tiers: tieredMaterials,
    tiersByGameId: tieredMaterialsByGameId,
    // DNA has no confirmed tier synthesis; tieredMaterials is empty so nothing
    // is synthesized. See data/tiers.js.
    synthesis: {
      ratio: 3,
      tierLevels: 3,
      supportsDecomposition: false,
    },
  },
  costs,
  data: {
    characters,
    weapons,
  },

  uiHandlers: {
    // Commissions run in waves and rewards reset past a threshold, so a wave
    // selector is the right shape here. Left off until per-wave drop amounts
    // are measured — the FarmingRates sheet still has them blank.
    showDungeonLevelSelector: false,
    getDungeonLevelOptions() {
      return [];
    },
    useTierSeparatedEstimates() {
      return false;
    },
    useDynamicFarmingRates: false,
  },

  createCharacterInitialSettings() {
    const activeSkillsSettings = this.formFields.characterActiveSkills.reduce((acc, skill) => {
      acc[`${skill.model_value}_current_level`] = 1;
      acc[`${skill.model_value}_target_level`] = 1;
      return acc;
    }, {});

    const passiveSkillsSettings = this.formFields.characterPassiveSkills.reduce((acc, skill) => {
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

export default dnaConfig;
