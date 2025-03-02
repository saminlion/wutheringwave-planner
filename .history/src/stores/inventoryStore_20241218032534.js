import { defineStore } from "pinia";
import inventoryData from "@/data/inventoryData.json";

export const useInventoryStore = defineStore("inventoryStore", {
  state: () => ({
    inventory: inventoryData, // 인벤토리 데이터 로드
  }),
  actions: {
    // 아이템 수량 업데이트
    updateItemCount(itemKey, count) {
      if (this.inventory[itemKey]) {
        this.inventory[itemKey].count = count;
      }
    },
    // 특정 아이템 수량 반환
    getItemCount(itemKey) {
      return this.inventory[itemKey]?.count || 0;
    },
  },
});
