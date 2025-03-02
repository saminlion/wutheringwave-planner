import { defineStore } from 'pinia';
import { activeSkills, passiveSkills } from '../data/formCharactersNew';

export const usePlannerStore = defineStore('planner', {
  state: () => ({
    inventory: {}, // { materialName: quantity }
    goals: [],     // [{ name: 'Diluc', type: 'character', materials: { mora: 100000, itemA: 20 } }]
    selectedCharacter: null, // 현재 선택된 캐릭터
    characterSettings: {}, // { characterId: { currentLevel, targetLevel, activeSkills, passiveSkills } }
  }),
  getters: {
    getMaterialNeeds: (state) => {
      return state.goals.reduce((needs, goal) => {
        Object.entries(goal.materials).forEach(([material, quantity]) => {
          needs[material] = (needs[material] || 0) + quantity - (state.inventory[material] || 0);
        });
        return needs;
      }, {});
    },
  },
  actions: {
    addGoal(goal) {
      this.goals.push(goal);
    },
    updateInventory(material, quantity) {
      this.inventory[material] = quantity;
    },
    selectCharacter(character) {
      this.selectedCharacter = character;
      if (!this.characterSettings[character.game_id]) {
        this.characterSettings[character.game_id] = {
          currentLevel: '1',
          targetLevel: '1',
          activeSkills: activeSkills.reduce((acc, skill) => {
            acc[`${skill.model_value}_current_level`] = 1;
            acc[`${skill.model_value}_target_level`] = 1;
            return acc;
          }, {}),
          passiveSkills: passiveSkills.tier_1.data.concat(passiveSkills.tier_2.data).reduce((acc, skill) => {
            acc[skill.model_value] = false;
            return acc;
          }, {}),
        };
      }
    },
    updateCharacterSettings(characterId, settings) {
      this.characterSettings[characterId] = {
        ...this.characterSettings[characterId],
        ...settings,
      };
    },
  },
});