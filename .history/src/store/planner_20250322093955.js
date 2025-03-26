import { defineStore } from 'pinia';
import { useInventoryStore } from './inventory.js'; // Inventory Store 가져오기
import costs from '../data/costs.json';
import characterData from '../data/character.json';
import weaponData from '../data/weapon.json';
import { calculateMaterials, processMaterials } from '../services/materialHelper.js';
import { getWeaponField } from '../services/weaponHelper.js';
import { getLevelRangeDiff } from '../services/utils.js';

const GLOBAL_STORAGE_KEY = 'Planner';

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
    getStorageKey(gameId) {
      return `${GLOBAL_STORAGE_KEY}_${gameId}`;
    },

    addGoal(goal) {
      const existingGoal = this.goals.find((g) => g.id === goal.id && g.type === goal.type);

      console.log(`[Debug] Check Goal: ${JSON.stringify(goal)}`);

      if (existingGoal) {
        console.log(`[Debug] Found existing goal with id: ${goal.id} and type: ${goal.type}`);
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
      const storageKey = this.getStorageKey(gameId);
      localStorage.setItem(storageKey, JSON.stringify(this.goals));
      console.log(`[Storage] Goals saved for ${gameId}:`, this.goals);
    },

    async loadGoals(gameId) {
      if (!gameId) return;
      const storageKey = this.getStorageKey(gameId);
      const storedGoals = localStorage.getItem(storageKey);
      if (storedGoals) {
        this.goals = JSON.parse(storedGoals);
        console.log(`[Storage] Goals loaded for ${gameId}:`, this.goals);
      } else {
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

    hydrate() {
      this.loadGoals(this.currentGameId);
      this.loadSettings(this.currentGameId);
    },

    calculateAllMaterials(id, type) {
      if (type == "character") {
        return this.calculateCharacterMaterials(id);
      }

      else if (type == "weapon") {
        return this.calculateWeaponMaterials(id);
      }
    },

    calculateWeaponMaterials(weaponId) {
      const settings = this.weaponSettings[weaponId];
      if (!settings) {
        console.error(`Weapon settings not found for ID: ${weaponId}`);
        return {};
      }

      const rarity = getWeaponField(weaponId, 'rarity');

      if (!rarity) {
        console.error(`Weapon rarity not found for ID: ${weaponId}`);
        return {};
      }

      // rarity에 따라 costs 데이터에서 level 정보를 동적으로 가져오기
      const levelSet = costs[0].weapon[`level_${rarity}`]; // 예: level_rarity5

      if (!levelSet) {
        console.error(`Level set not found for rarity: ${rarity}`);
        return {};
      }

      const weaponInfo = Object.values(weaponData).find((weapon) => weapon.game_id === weaponId);
      if (!weaponInfo) {
        console.error(`Character data not found for ID: ${weaponId}`);
        return {};
      }


      const levelsToFarm = getLevelRangeDiff(
        Object.entries(levelSet).map(([level, data]) => ({ level, ...data })),
        settings.currentLevel,
        settings.targetLevel
      );

      const materials = {};
      levelsToFarm.forEach((levelData) => {
        Object.entries(levelData).forEach(([key, value]) => {
          processMaterials(materials, key, value, weaponInfo);
        });
      });

      this.materialsCache[weaponId] = materials;
      return materials;
    },

    calculateCharacterMaterials(characterId) {
      const settings = this.characterSettings[characterId];

      if (!settings) {
        console.error(`Character settings not found for ID: ${characterId}`);
        return {};
      }

      const characterInfo = Object.values(characterData).find((char) => char.game_id === characterId);
      if (!characterInfo) {
        console.error(`Character data not found for ID: ${characterId}`);
        return {};
      }

      // 작업별 캐시 분리
      const materials = { level: {}, skill: {}, passive: {} };

      console.log("enter", settings);

      // 1. 레벨업 재료 계산
      const levelsToFarm = getLevelRangeDiff(
        Object.entries(costs[0].character.level).map(([level, data]) => ({ level, ...data })),
        settings.currentLevel,
        settings.targetLevel
      );

      console.log('[Level] Level range to farm:', levelsToFarm.map((l) => l.level));

      levelsToFarm.forEach((levelData) => {

        console.log(`[Level] Processing LevelData `, levelData);

        Object.entries(levelData).forEach(([key, value]) => {
          if (key === 'level') return; // level 자체는 재료 아님
          console.log(`[Level] → Material Key: ${key}, Value: ${JSON.stringify(value)}`);
          processMaterials(materials.level, key, value, characterInfo);
        });
      });
      console.log('[Level] Final Level Materials:', materials.level);

      // 2. 스킬 레벨업 재료 계산
      Object.keys(settings.activeSkills).forEach((skillKey) => {

        console.log("Processing skillKey:", skillKey);

        if (skillKey.endsWith('_current_level')) {
          const baseKey = skillKey.replace('_current_level', '');
          const targetKey = `${baseKey}_target_level`;

          const current = parseInt(settings.activeSkills[skillKey], 10);
          const target = parseInt(settings.activeSkills[targetKey], 10);

          console.log("Current Level:", current, "Target Level:", target);

          if (isNaN(current) || isNaN(target) || current >= target) {
            console.warn(`Skipping skill: ${skillKey} (Invalid levels or already maxed)`);
            return;
          }

          for (let level = current + 1; level <= target; level++) {
            const skillCosts = costs[0].character.skill[level];

            console.log(`Skill Costs for level ${level}:`, skillCosts);
            console.log(`Skill Costs Entries:`, Object.entries(skillCosts));

            try {
              Object.entries(skillCosts).forEach(([key, value]) => {
                console.log(`Processing material: ${key} => ${value}`);
                processMaterials(materials.skill, key, value, characterInfo);
              });
            } catch (error) {
              console.error(`Error processing materials for level ${level}`, error);
            }
          }
        }
      });

      // 3. 패시브 스킬 재료 계산
      Object.entries(settings.passiveSkills).forEach(([key, isEnabled]) => {
        if (isEnabled) {
          let passiveCosts;

          console.log(`bonus_stats: ${key}`);

          // passive_ability 처리
          if (key.startsWith('passive_ability')) {
            const skillIndex = key.split('_').pop(); // "1" 또는 "2" 추출
            passiveCosts = costs[0].character.passive.skill[skillIndex];
          }

          // bonus_stats 처리
          if (key.startsWith('bonus_stats_')) {
            const parts = key.split('_'); // "bonus_stats_1_1" -> ["bonus", "stats", "1", "1"]
            const tier = parts[2]; // "1"
            const statIndex = parts[3]; // "1"

            console.log(`Extracted tier: ${tier}, statIndex: ${statIndex}`);

            passiveCosts = costs[0].character.passive.stat[tier];
          }

          if (passiveCosts) {
            Object.entries(passiveCosts).forEach(([key, value]) => {
              processMaterials(materials.passive, key, value, characterInfo);
            });
          }
        }
      });
      // 최종 재료 병합
      //const finalMaterials = { ...materials.level, ...materials.skill, ...materials.passive };
      const finalMaterials = mergeMaterials(materials.level, materials.skill, materials.passive)
      console.log('[Debug] Merged Materials:', finalMaterials);
      this.materialsCache[characterId] = finalMaterials;

      console.log('Final Materials:', finalMaterials);
      return finalMaterials;
    },

    mergeMaterials(...materialSources) {
      const merged = {};
      materialSources.forEach((source) => {
        Object.entries(source).forEach(([material, amount]) => {
          merged[material] = (merged[material] || 0) + amount;
        });
      });
      return merged;
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
