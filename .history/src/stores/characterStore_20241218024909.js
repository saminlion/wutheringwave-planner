import { defineStore } from 'pinia';

export const useCharacterStore = defineStore('characterStore', {
  state: () => ({
    characters: [
      {
        name: 'Character A',
        currentLevel: 1,
        targetLevel: 10,
        skills: [
          { name: 'Skill 1', currentLevel: 1, targetLevel: 10 },
          { name: 'Skill 2', currentLevel: 1, targetLevel: 10 },
        ],
      },
    ],
    selectedCharacter: null,
  }),
  actions: {
    setSelectedCharacter(name) {
      this.selectedCharacter = this.characters.find((c) => c.name === name);
    },
    updateCharacterLevel({ currentLevel, targetLevel }) {
      this.selectedCharacter.currentLevel = currentLevel;
      this.selectedCharacter.targetLevel = targetLevel;
    },
    updateCharacterSkills(skills) {
      this.selectedCharacter.skills = skills;
    },
  },
});