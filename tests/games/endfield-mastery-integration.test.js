import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/store/game';
import { usePlannerStore } from '@/store/planner';
import endfieldPlugin from '@/games/endfield';
import { calculateCharacterMaterials } from '@/services/materialHelper/character';
import characters from '@/games/endfield/data/character.json';

describe('Endfield per-skill mastery (integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const gameStore = useGameStore();
    gameStore.switchGame('endfield');
    expect(gameStore.currentGame?.id).toBe('endfield');
  });

  // The sheet is the source of truth for which material each skill uses — an
  // operator may use one material for all four skills, or a different one per skill.
  // These tests check the calculation follows whatever the data says, never what
  // the data "should" be.

  // A per-skill material wins over `special` (the promotion material) for mastery,
  // and every skill is charged its own material.
  it('charges each skill its own mastery material from the data', () => {
    const operator = {
      game_id: 1,
      special: 900,
      mastery_basic_attack: 901,
      mastery_battle_skill: 902,
      mastery_combo_skill: 903,
      mastery_ultimate: 904,
    };
    const settings = {
      currentLevel: '1',
      targetLevel: '1',
      skills: {
        basic_attack: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        battle_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        combo_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        ultimate: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
      },
    };

    const result = calculateCharacterMaterials(settings, operator);

    // mastery 1+2+3 costs 6+16+36 = 58 of the skill's material
    for (const id of [901, 902, 903, 904]) expect(result[id]).toBe(58);
    expect(result[900]).toBeUndefined();
  });

  it('one material for every skill is charged as one combined total', () => {
    const operator = {
      game_id: 2,
      special: 900,
      mastery_basic_attack: 905,
      mastery_battle_skill: 905,
      mastery_combo_skill: 905,
      mastery_ultimate: 905,
    };
    const settings = {
      currentLevel: '1',
      targetLevel: '1',
      skills: {
        basic_attack: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        battle_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        combo_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        ultimate: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
      },
    };

    expect(calculateCharacterMaterials(settings, operator)[905]).toBe(58 * 4);
  });

  it('raising three skills charges each its own data-named material', () => {
    const liino = characters.liino;
    const settings = {
      currentLevel: '1',
      targetLevel: '1',
      skills: {
        basic_attack: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        battle_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 0 },
        combo_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
        ultimate: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
      },
    };

    const result = calculateCharacterMaterials(settings, liino);

    // mastery 1+2+3 costs 6+16+36 = 58 per raised skill, of whatever the data names
    const expected = {};
    for (const skill of ['basic_attack', 'combo_skill', 'ultimate']) {
      const id = liino[`mastery_${skill}`];
      expected[id] = (expected[id] || 0) + 58;
    }
    for (const [id, qty] of Object.entries(expected)) expect(result[id]).toBe(qty);
  });

  // This is the path recalculateAllGoals() uses on PlannerView mount. It looks the
  // character up with `char.game_id === characterId`, so a string id from persisted
  // localStorage would miss and silently keep the stale goal snapshot.
  it('planner store recalculates via the goal id, for both number and string ids', () => {
    const plannerStore = usePlannerStore();
    const skills = {
      basic_attack: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
      battle_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 0 },
      combo_skill: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
      ultimate: { current_level: 1, target_level: 1, current_mastery: 0, target_mastery: 3 },
    };

    const liino = characters.liino;
    const expected = {};
    for (const skill of ['basic_attack', 'combo_skill', 'ultimate']) {
      const id = liino[`mastery_${skill}`];
      expected[id] = (expected[id] || 0) + 58;
    }

    for (const id of [liino.game_id, String(liino.game_id)]) {
      plannerStore.characterSettings[id] = { currentLevel: '1', targetLevel: '1', skills };
      const out = plannerStore.calculateAllMaterials(id, 'character');
      for (const [matId, qty] of Object.entries(expected)) {
        expect(out[matId], `material ${matId} for id ${JSON.stringify(id)}`).toBe(qty);
      }
    }
  });
  // A goal entry the planner cannot find in materials.json is invisible in Final Material
  // Needs yet still counted as missing on Complete ("insufficient" with nothing to farm).
  it('every material a fully-built operator needs exists in materials.json', () => {
    const config = endfieldPlugin.config;
    const materials = endfieldPlugin.getData('materials');
    // EXP costs are keyed by their category; everything else by game_id
    const known = new Set(Object.keys(materials));
    for (const category of Object.values(materials)) {
      for (const item of Object.values(category)) known.add(String(item.game_id));
    }

    const settings = config.createCharacterInitialSettings();
    const levels = config.formFields.characterLevelItems;
    settings.targetLevel = levels[levels.length - 1].value;
    for (const skill of Object.values(settings.skills)) Object.assign(skill, { target_level: 12, target_mastery: 3 });
    for (const s of Object.values(settings.special)) s.target_level = 2;
    for (const s of Object.values(settings.baseSkill)) s.target_level = 2;
    for (const key of Object.keys(settings.attributes)) settings.attributes[key] = true;

    const unknown = [];
    for (const operator of Object.values(characters)) {
      const out = calculateCharacterMaterials(structuredClone(settings), operator);
      for (const id of Object.keys(out)) {
        if (!known.has(id)) unknown.push(`${operator.display_name}: ${id}`);
      }
    }
    expect(unknown).toEqual([]);
  });
});
