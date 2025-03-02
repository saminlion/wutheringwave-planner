import { defineStore } from 'pinia';

const GLOBAL_STORAGE_KEY = 'Inventory';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventory: {}, // { materialId: quantity }
    currentGameId: null, // 현재 선택된 게임 ID
  }),

  getters: {
    // Get total quantity for a specific material
    getMaterialQuantity: (state) => (materialId) => {
      return state.inventory[materialId] || 0;
    },

    getStorageKey(gameId)
    {
      return `${GLOBAL_STORAGE_KEY}_${gameId}`;
    },
  },

  actions: {
    // Add materials to the inventory
    addMaterial(materialId, quantity) {
      if (!materialId || quantity <= 0) {
        console.warn(`[Inventory] Invalid material or quantity: ${materialId}, ${quantity}`);
        return;
      }
      if (this.inventory[materialId]) {
        this.inventory[materialId] += quantity;
      } else {
        this.inventory[materialId] = quantity;
      }
      console.log(`[Inventory] Added: ${quantity} of ${materialId}. Total: ${this.inventory[materialId]}`);

      this.saveInventory(this.currentGameId);
    },

    // Remove materials from the inventory
    removeMaterial(materialId, quantity) {
      if (!this.inventory[materialId]) {
        console.warn(`[Inventory] Material not found: ${materialId}`);
        return;
      }
      this.inventory[materialId] -= quantity;
      if (this.inventory[materialId] <= 0) {
        delete this.inventory[materialId]; // Remove material if quantity is zero or less
      }
      console.log(`[Inventory] Removed: ${quantity} of ${materialId}. Remaining: ${this.inventory[materialId] || 0}`);

      this.saveInventory(this.currentGameId);
    },

    // Set materials directly (e.g., for initializing)
    setInventory(newInventory) {
      this.inventory = { ...newInventory };
      console.log(`[Inventory] Set new inventory:`, this.inventory);
    },

    saveInventory(gameId)
    {
      if (!gameId) return;

      const storageKey = this.getStorageKey(gameId);

      localStorage.setItem(storageKey, JSON.stringify(this.inventory));

      console.log(`[Storage] Inventory saved for ${gameId}:`, this.inventory);
    },

    loadInventory(gameId)
    {
      if (!gameId) return;

      const storageKey = this.getStorageKey(gameId);
      const storageInventory = localStorage.getItem(storageKey);

      if (storageInventory)
      {
        this.inventory = JSON.parse(storageInventory);

        console.log(`[Storage] Inventory loaded for ${gameId}:`, this.inventory);
      }

      else
      {
        this.inventory = {};
      }
    },

    hydrate(gameId)
    {
      this.currentGameId = gameId;
      this.loadInventory(gameId);      
    }
  },
});
