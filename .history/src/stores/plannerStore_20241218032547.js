import { defineStore } from "pinia";
import { useCharacterStore } from "./characterStore";
import { useInventoryStore } from "./inventoryStore";
import { calculateMaterials } from "@/services/materialsService";

export const usePlannerStore = defineStore("plannerStore", {
  state: () => ({
    plannedCharacters: [], // 설정된 캐릭터들
  }),
  actions: {
    // 캐릭터 추가
    addCharacterToPlan(name) {
      const characterStore = useCharacterStore();
      if (characterStore.characters[name]) {
        this.plannedCharacters.push({ ...characterStore.characters[name] });
      }
    },
    // 전체 필요 재료 계산
    calculateNeededMaterials() {
      const characterStore = useCharacterStore();
      return calculateMaterials(this.plannedCharacters);
    },
    // 부족한 재료 계산
    calculateMissingMaterials() {
      const inventoryStore = useInventoryStore();
      const neededMaterials = this.calculateNeededMaterials();

      return neededMaterials.map((material) => {
        const owned = inventoryStore.getItemCount(material.name);
        return {
          ...material,
          missing: Math.max(0, material.count - owned),
        };
      });
    },
  },
});
