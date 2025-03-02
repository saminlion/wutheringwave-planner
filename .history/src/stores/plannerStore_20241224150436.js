import { defineStore } from 'pinia';

export const usePlannerStore = defineStore('planner', {
  state: () => ({
    inventory: {}, // { materialName: quantity }
    goals: [],     // [{ name: 'Diluc', type: 'character', materials: { mora: 100000, itemA: 20 } }]
    selectedCharacter: null, // 현재 선택된 캐릭터
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
    },
  },
});