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
      // 새로운 객체로 교체하여 반응성 트리거
      this.inventory = {
        ...this.inventory,
        [materialId]: (this.inventory[materialId] || 0) + quantity
      };
      logger.debug(`Added: ${quantity} of ${materialId}. Total: ${this.inventory[materialId]}`);

      this.saveInventory(this.currentGameId);
    },

    // Remove materials from the inventory
    removeMaterial(materialId, quantity) {
      if (!this.inventory[materialId]) {
        logger.warn(`Material not found: ${materialId}`);
        return;
      }
      const newQuantity = this.inventory[materialId] - quantity;

      // 새로운 객체로 교체하여 반응성 트리거
      if (newQuantity <= 0) {
        // 속성 제거: delete 대신 destructuring 사용
        const { [materialId]: _, ...rest } = this.inventory;
        this.inventory = rest;
      } else {
        this.inventory = {
          ...this.inventory,
          [materialId]: newQuantity
        };
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

      // 새로운 객체로 교체하여 반응성 트리거
      if (newQuantity === 0) {
        // 속성 제거: delete 대신 destructuring 사용
        const { [materialId]: _, ...rest } = this.inventory;
        this.inventory = rest;
      } else {
        this.inventory = {
          ...this.inventory,
          [materialId]: newQuantity
        };
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
    },

    // Batch remove materials (single save at the end for performance)
    batchRemoveMaterials(materialsToRemove) {
      if (!materialsToRemove || materialsToRemove.length === 0) return;

      let newInventory = { ...this.inventory };

      for (const { materialId, quantity } of materialsToRemove) {
        if (!newInventory[materialId]) continue;

        const newQuantity = newInventory[materialId] - quantity;

        if (newQuantity <= 0) {
          delete newInventory[materialId];
        } else {
          newInventory[materialId] = newQuantity;
        }

        logger.debug(`Batch removed: ${quantity} of ${materialId}. Remaining: ${newInventory[materialId] || 0}`);
      }

      // Update state once
      this.inventory = newInventory;

      // Save once at the end
      this.saveInventory(this.currentGameId);
    },

    // Batch update materials (single save at the end for performance)
    // operations: [{ materialId, quantity, operation: 'add' | 'remove' }]
    batchUpdateMaterials(operations) {
      if (!operations || operations.length === 0) return;

      let newInventory = { ...this.inventory };

      for (const { materialId, quantity, operation } of operations) {
        if (operation === 'add') {
          newInventory[materialId] = (newInventory[materialId] || 0) + quantity;
          logger.debug(`Batch added: ${quantity} of ${materialId}. Total: ${newInventory[materialId]}`);
        } else if (operation === 'remove') {
          if (!newInventory[materialId]) continue;

          const newQuantity = newInventory[materialId] - quantity;

          if (newQuantity <= 0) {
            delete newInventory[materialId];
          } else {
            newInventory[materialId] = newQuantity;
          }

          logger.debug(`Batch removed: ${quantity} of ${materialId}. Remaining: ${newInventory[materialId] || 0}`);
        }
      }

      // Update state once
      this.inventory = newInventory;

      // Save once at the end
      this.saveInventory(this.currentGameId);
    }
  },
});
