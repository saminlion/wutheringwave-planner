import { defineStore } from 'pinia';
import logger from '@/utils/logger';
import errorHandler from '@/utils/errorHandler';

const GLOBAL_STORAGE_KEY = 'gameplanner_inventory';

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
  },

  actions: {
    getStorageKey(gameId)
    {
        if (!gameId) return null;
      return `${GLOBAL_STORAGE_KEY}_${gameId}`;
    },

    // Add materials to the inventory
    addMaterial(materialId, quantity) {
      if (!materialId || quantity <= 0) {
        logger.warn(`Invalid material or quantity: ${materialId}, ${quantity}`);
        return;
      }
      if (this.inventory[materialId]) {
        this.inventory[materialId] += quantity;
      } else {
        this.inventory[materialId] = quantity;
      }
      logger.debug(`Added: ${quantity} of ${materialId}. Total: ${this.inventory[materialId]}`);

      this.saveInventory(this.currentGameId);
    },

    // Remove materials from the inventory
    removeMaterial(materialId, quantity) {
      if (!this.inventory[materialId]) {
        logger.warn(`Material not found: ${materialId}`);
        return;
      }
      this.inventory[materialId] -= quantity;
      if (this.inventory[materialId] <= 0) {
        delete this.inventory[materialId]; // Remove material if quantity is zero or less
      }
      logger.debug(`Removed: ${quantity} of ${materialId}. Remaining: ${this.inventory[materialId] || 0}`);

      this.saveInventory(this.currentGameId);
    },

    // Set materials directly (e.g., for initializing)
    setInventory(newInventory) {
      this.inventory = { ...newInventory };
      logger.debug('Set new inventory:', this.inventory);
    },

    // Set a specific material's quantity (for input fields)
    setMaterialQuantity(materialId, quantity) {
      if (!materialId) {
        logger.warn(`Invalid materialId: ${materialId}`);
        return;
      }

      const newQuantity = Math.max(0, quantity);
      if (newQuantity === 0) {
        delete this.inventory[materialId];
      } else {
        this.inventory[materialId] = newQuantity;
      }
      logger.debug(`Set material ${materialId} to ${newQuantity}`);

      this.saveInventory(this.currentGameId);
    },

    saveInventory(gameId)
    {
      if (!gameId) return;

      try {
        const storageKey = this.getStorageKey(gameId);
        localStorage.setItem(storageKey, JSON.stringify(this.inventory));
        logger.debug(`Inventory saved for ${gameId}:`, this.inventory);
      } catch (error) {
        errorHandler.handle(error, 'saveInventory');
      }
    },

    loadInventory(gameId)
    {
      if (!gameId) return;

      try {
        const storageKey = this.getStorageKey(gameId);
        const storageInventory = localStorage.getItem(storageKey);

        if (storageInventory)
        {
          this.inventory = JSON.parse(storageInventory);
          logger.debug(`Inventory loaded for ${gameId}:`, this.inventory);
        }
        else
        {
          this.inventory = {};
        }
      } catch (error) {
        errorHandler.handle(error, 'loadInventory');
        this.inventory = {};
      }
    },

    hydrate(gameId)
    {
      logger.debug(`Inventory gameID ${gameId}:`, this.inventory);
      this.currentGameId = gameId;
      this.loadInventory(gameId);
    }
  },
});
