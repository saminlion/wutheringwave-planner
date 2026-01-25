import { defineStore } from 'pinia';
import { useInventoryStore } from './inventory.js'; // Inventory Store 가져오기
import { useGameStore } from './game.js';
import { getWeaponField } from '../services/weaponHelper.js';

/**
 * 現在のゲームのデータを取得するヘルパー
 */
const getGameData = (type) => {
  const gameStore = useGameStore();
  return gameStore.getData(type) || {};
};
import {
  calculateCharacterMaterials,
  calculateLevelMaterials,
  calculateSkillMaterials,
  calculatePassiveMaterials
} from '@/services/materialHelper/character';

import { calculateWeaponMaterials } from '@/services/materialHelper/weapon';

import { calculateMaterials } from '@/services/materialHelper/plannerCalc';
import logger from '@/utils/logger';
import errorHandler from '@/utils/errorHandler';

const GLOBAL_STORAGE_KEY = 'wwplanner';

export const usePlannerStore = defineStore('planner', {
  state: () => ({
    goals: [], // [{ name: 'CharacterName', type: 'character', materials: { mora: 100000, itemA: 20 } }]
    selectedCharacter: null, // 현재 선택된 캐릭터
    selectedWeapon: null,
    characterSettings: {}, // { characterId: { currentLevel, targetLevel, activeSkills, passiveSkills } }
    weaponSettings: {},
    materialsCache: {}, // 캐시된 재료 데이터
    currentGameId: 'wutheringwave', // 현재 선택된 게임 ID
  }),

  getters: {
    // 표시할 목표만 반환
    visibleGoals: (state) => state.goals.filter((goal) => !goal.isHidden),

    getMaterialNeeds: (state) => {
      const inventoryStore = useInventoryStore(); // Inventory Store 참조
      const inventory = inventoryStore.inventory;

      return state.goals.reduce((needs, goal) => {
        Object.entries(goal.materials).forEach(([material, quantity]) => {
          needs[material] = (needs[material] || 0) + quantity - (inventory[material] || 0);
        });
        return needs;
      }, {});
    },
  },
  actions: {
    getStorageKey(prefix, gameId) {
      if (!gameId) return null;
      if (!prefix) return `${GLOBAL_STORAGE_KEY}_goals_${gameId}`;

      return `${GLOBAL_STORAGE_KEY}_${prefix}_${gameId}`;
    },

    addGoal(goal) {
      const existingGoal = this.goals.find((g) => g.id === goal.id && g.type === goal.type);

      logger.debug('Check Goal:', goal);

      if (existingGoal) {
        logger.debug(`Found existing goal with id: ${goal.id} and type: ${goal.type}`);
        existingGoal.materials = goal.materials;
        existingGoal.isHidden = false; // 숨겨져 있던 목표를 다시 활성화
      } else {
        this.goals.push({ ...goal, isHidden: false });
      }

      this.saveGoals(this.currentGameId); // 저장
    },

    revealGoal(goalId, goalType) {
      const goal = this.goals.find((g) => g.id === goalId && g.type === goalType);
      if (goal) {
        goal.isHidden = false;
        this.saveGoals(this.currentGameId);
      }
    },

    removeGoal(goalId, goalType) {
      this.goals = this.goals.filter((goal) => !(goal.id === goalId && goal.type === goalType));
      this.saveGoals(this.currentGameId);
    },

    hideGoal(goalId, goalType) {
      const goal = this.goals.find((g) => g.id === goalId && g.type === goalType);
      if (goal) {
        goal.isHidden = true;
        this.saveGoals(this.currentGameId);
      }
    },

    // 저장 부분
    async saveGoals(gameId) {
      if (!gameId) return;
      try {
        const storageKey = this.getStorageKey('goals', gameId);
        localStorage.setItem(storageKey, JSON.stringify(this.goals));
        logger.debug(`Goals saved for ${gameId}:`, this.goals);
      } catch (error) {
        errorHandler.handle(error, 'saveGoals');
      }
    },

    async loadGoals(gameId) {
      if (!gameId) return;
      try {
        const storageKey = this.getStorageKey('goals', gameId);
        const storedGoals = localStorage.getItem(storageKey);
        if (storedGoals) {
          this.goals = JSON.parse(storedGoals);
          logger.debug(`Goals loaded for ${gameId}:`, this.goals);
        } else {
          this.goals = [];
        }
      } catch (error) {
        errorHandler.handle(error, 'loadGoals');
        this.goals = [];
      }
    },

    saveSettings(gameId) {
      if (!gameId) return;
      const charStorageKey = this.getStorageKey('character', gameId);
      const weaponStorageKey = this.getStorageKey('weapon', gameId);

      localStorage.setItem(charStorageKey, JSON.stringify(this.characterSettings));
      localStorage.setItem(weaponStorageKey, JSON.stringify(this.weaponSettings));
    },

    loadSettings(gameId) {
      if (!gameId) return;
      const charStorageKey = this.getStorageKey('character', gameId);
      const weaponStorageKey = this.getStorageKey('weapon', gameId);

      const storedCharacterSettings = localStorage.getItem(charStorageKey);
      const storedWeaponSettings = localStorage.getItem(weaponStorageKey);

      this.characterSettings = storedCharacterSettings ? JSON.parse(storedCharacterSettings) : {};
      this.weaponSettings = storedWeaponSettings ? JSON.parse(storedWeaponSettings) : {};
    },

    hydrate(gameId = null) {
      // gameStoreのcurrentGameIdを優先的に使用
      const gameStore = useGameStore();
      const targetGameId = gameId ?? gameStore.currentGameId ?? this.currentGameId;
      this.currentGameId = targetGameId;
      this.loadGoals(targetGameId);
      this.loadSettings(targetGameId);
    },

    calculateCharacterMaterials(characterId) {
      const settings = this.characterSettings[characterId];
      const characterData = getGameData('characters');
      const characterInfo = Object.values(characterData).find((char) => char.game_id === characterId);
      if (!settings || !characterInfo) return {};

      const result = calculateCharacterMaterials(settings, characterInfo);
      this.materialsCache[characterId] = result;
      return result;
    },
    calculateWeaponMaterials(weaponId) {
      const settings = this.weaponSettings[weaponId];
      const weaponData = getGameData('weapons');
      const weaponInfo = Object.values(weaponData).find((w) => w.game_id === weaponId);
      const rarity = getWeaponField(weaponId, 'rarity');
      if (!settings || !weaponInfo || !rarity) return {};

      const result = calculateWeaponMaterials(settings, weaponInfo, rarity);
      this.materialsCache[weaponId] = result;
      return result;
    },
    calculateAllMaterials(id, type) {
      if (type == "character") {
        return this.calculateCharacterMaterials(id);
      }

      else if (type == "weapon") {
        return this.calculateWeaponMaterials(id);
      }
    },
    selectCharacter(character) {
      this.selectedCharacter = character;
    },

    selectedWeapon(weapon) {
      this.selectedWeapon = weapon;
    },

    updateWeaponSettings(weaponId, updatedSettings) {
      if (!this.weaponSettings[weaponId]) {
        this.weaponSettings[weaponId] = { ...updatedSettings };
      } else {
        this.weaponSettings[weaponId] = {
          ...this.weaponSettings[weaponId],
          ...updatedSettings,
        };
      }

      this.saveSettings(this.currentGameId);
    },

    updateCharacterSettings(characterId, updatedSettings) {
      if (!this.characterSettings[characterId]) {
        this.characterSettings[characterId] = { ...updatedSettings };
      } else {
        this.characterSettings[characterId] = {
          ...this.characterSettings[characterId],
          ...updatedSettings,
        };
      }
      this.saveSettings(this.currentGameId);
    },
  },
});
