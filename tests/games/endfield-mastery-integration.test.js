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

  // Liino's mastery materials differ per skill, and none of them is the `special`
  // material used for ascension. The sheet's `mastery_*_id` formula columns are off
  // by one column, so the sync resolves these from the `_special_name` columns
  // instead — see MASTERY_COLUMNS in scripts/sync-sheets.js.
  it('Liino has two distinct mastery materials, neither being `special`', () => {
    const liino = characters.liino;
    expect(liino.mastery_basic_attack).toBe(5130010034); // Metadiastima Photoemission Tube
    expect(liino.mastery_battle_skill).toBe(5130010035); // D96 Steel Sample 4
    expect(liino.mastery_combo_skill).toBe(5130010034);
    expect(liino.mastery_ultimate).toBe(5130010035);
    expect(liino.special).toBe(5130010037); // Quadrant Fitting Fluid — ascension only
  });

  // The stale id columns made battle_skill resolve from the Basic Attack name, so
  // battle_skill and combo_skill came out identical for all 33 characters.
  it('battle_skill and combo_skill are not blanket copies of each other', () => {
    const differ = Object.values(characters)
      .filter((c) => c.mastery_battle_skill !== c.mastery_combo_skill);
    expect(differ.length).toBeGreaterThan(0);
  });

  // Verified game rule: two mastery materials per operator, paired basic/combo and
  // battle/ultimate. Akekuri is the only operator using one material for all four.
  it('every operator pairs basic with combo and battle with ultimate', () => {
    for (const c of Object.values(characters)) {
      expect(c.mastery_basic_attack, `${c.display_name} basic vs combo`).toBe(c.mastery_combo_skill);
      expect(c.mastery_battle_skill, `${c.display_name} battle vs ultimate`).toBe(c.mastery_ultimate);
    }
  });

  // The sheet left the mastery columns as copies of special_name for most operators;
  // scripts/overrides/endfield-mastery.js replaces them with verified values.
  it('mastery materials are not just the promotion material', () => {
    const catcher = Object.values(characters).find((c) => c.display_name === 'Catcher');
    expect(catcher.special).toBe(5130010036); // Tachyon Screening Lattice — promotion only
    expect(catcher.mastery_basic_attack).toBe(5130010034); // Metadiastima
    expect(catcher.mastery_battle_skill).toBe(5130010035); // D96
  });

  it('raising mastery on basic_attack + combo + ultimate yields BOTH materials', () => {
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

    // mastery 1+2+3 costs special 6+16+36 = 58 per skill
    expect(result[5130010034]).toBe(58 * 2);   // basic_attack + combo
    expect(result[5130010035]).toBe(58);       // ultimate only
    expect(result[5130010037]).toBeUndefined(); // battle_skill untouched, so no `special`
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

    for (const id of [5260500030, '5260500030']) {
      plannerStore.characterSettings[id] = { currentLevel: '1', targetLevel: '1', skills };
      const out = plannerStore.calculateAllMaterials(id, 'character');
      expect(out[5130010034], `basic_attack+combo material for id ${JSON.stringify(id)}`).toBe(116);
      expect(out[5130010035], `ultimate material for id ${JSON.stringify(id)}`).toBe(58);
    }
  });
});
