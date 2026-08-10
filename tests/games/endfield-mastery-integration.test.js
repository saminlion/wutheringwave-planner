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

  it('Liino has two distinct mastery materials in the data', () => {
    const liino = characters.liino;
    expect(liino.mastery_basic_attack).toBe(5130010037);
    expect(liino.mastery_combo_skill).toBe(5130010034);
    expect(liino.mastery_ultimate).toBe(5130010034);
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
    expect(result[5130010037]).toBe(58);       // basic_attack only
    expect(result[5130010034]).toBe(58 * 2);   // combo + ultimate
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
      expect(out[5130010037], `basic_attack material for id ${JSON.stringify(id)}`).toBe(58);
      expect(out[5130010034], `combo+ultimate material for id ${JSON.stringify(id)}`).toBe(116);
    }
  });
});
