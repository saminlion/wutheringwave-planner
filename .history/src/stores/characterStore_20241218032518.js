import { defineStore } from "pinia";
import characterData from "@/data/characterData.json";

export const useCharacterStore = defineStore("characterStore", {
  state: () => ({
    characters: characterData, // 캐릭터 데이터 로드
    selectedCharacter: null, // 선택된 캐릭터 상태
  }),
  actions: {
    // 캐릭터 선택
    setSelectedCharacter(name) {
      this.selectedCharacter = this.characters[name] || null;
    },
    // 레벨 설정 업데이트
    updateCharacterLevel(name, currentLevel, targetLevel) {
      if (this.characters[name]) {
        this.characters[name].char_current_level = currentLevel;
        this.characters[name].char_target_level = targetLevel;
      }
    },
    // 스킬 레벨 업데이트
    updateCharacterSkill(name, skillName, currentLevel, targetLevel) {
      if (this.characters[name]) {
        this.characters[name][`${skillName}_current_level`] = currentLevel;
        this.characters[name][`${skillName}_target_level`] = targetLevel;
      }
    },
  },
});
