<template>
  <div>
    <h1>Planner</h1>
    <div>
      <h2>Goals</h2>
      <div class="goals-container">
        <div class="goal-border" v-for="goal in goals" :key="goal.name"
          :class="{ hidden: hiddenGoals[goal.id] }"
          :style="setGradientStyle(getRawData(goal.id), true)">
          <div class="goal-card">
            <!-- 罹먮┃???대쫫怨??꾩씠肄?-->
            <div class="goal-header">
              <div class="character-container"
                v-if="isCharacterGoal(goal.id)">
                <img :src="getCharacterField(goal.id, 'icon')" alt="Character Icon" class="character-icon" />
                <h3>{{ tCharacter(goal.id, getCharacterField(goal.id, 'display_name')) }}</h3>
                <div class="icon-container">
                  <!-- Delete Button -->
                  <button class="delete-button" @click="removeGoal(goal.id, 'character')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>

                  <!-- Hide Button -->
                  <button class="hide-button" @click="hideGoal(goal.id, 'character')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>

                  </button>

                  <!-- Edit Button -->
                  <button class="edit-button" @click="openDialog(goal)">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>

                  </button>

                  <!-- Complete Button -->
                  <button class="complete-button" @click="completeGoal(goal.id, isCharacterGoal(goal.id) ? 'character' : 'weapon')" title="Mark as Complete">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="weapon-container" v-else>
                <img :src="getWeaponField(goal.id, 'icon')" alt="Weapon Icon" class="character-icon" />
                <h3>{{ tWeapon(goal.id, getWeaponField(goal.id, 'display_name')) }}</h3>
                <div class="icon-container">
                  <!-- Delete Button -->
                  <button class="delete-button" @click="removeGoal(goal.id, 'weapon')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>

                  <!-- Hide Button -->
                  <button class="hide-button" @click="hideGoal(goal.id, 'weapon')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>

                  <!-- Edit Button -->
                  <button class="edit-button" @click="openDialog(goal)">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>

                  </button>

                  <!-- Complete Button -->
                  <button class="complete-button" @click="completeGoal(goal.id, isCharacterGoal(goal.id) ? 'character' : 'weapon')" title="Mark as Complete">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="icon-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Materials List -->
            <div class="goal-materials">
              <div class="materials-grid">
                <div class="material-card" v-for="(qty, mat) in filterProcessed(goal.materials)" :key="mat">
                  <img v-if="getMaterialIcon(mat)" :src="getMaterialIcon(mat)" alt="material icon"
                    class="material-icon" />
                  <div class="material-info">
                    <span class="material-quantity">{{ qty }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div><!--goal-card end-->
        </div> <!--goal-border end-->
      </div>
    </div>

    <FinalMaterialNeeds :materials="finalMaterialNeeds.materials" :key="refreshKey" @updateInventory="handleInventoryUpdate" />

    <component
      :is="CharacterDialogComponent"
      v-if="dialogVisible && dialogType === 'character' && selectedCharacter && CharacterDialogComponent"
      :visible="dialogVisible"
      :character="selectedCharacter"
      :settings="currentSettings"
      :levelItems="characterLevelItems"
      :activeSkills="characterActiveSkills"
      :passiveSkills="characterPassiveSkills"
      @close="dialogVisible = false"
      @updateCharacter="updateCharacter"
    />

    <WeaponDialog v-if="dialogVisible && dialogType === 'weapon' && selectedWeapon" :visible="dialogVisible"
      :weapon="selectedWeapon" :settings="currentSettings" :levelItems="weaponLevelItems" @close="dialogVisible = false"
      @updateweapon="updateweapon" />
  </div>
</template>

<script setup>
import { watch, computed, toRaw, onMounted, ref } from "vue";
import { usePlannerStore } from "@/store/planner";
import { useInventoryStore } from "@/store/inventory";
import { useGameStore } from "@/store/game";
import { useLocale } from '@/composables/useLocale';

// i18n翻訳関数を取得
const { tCharacter, tWeapon, tMaterial } = useLocale();
import {
  findMaterial,
  getMaterialField,
  getMaterialFieldById,
  calculatePlayerExp,
  calculateMaterials,
} from "@/services/materialHelper/index";
import { getCharacterField } from "@/services/characterHelper";
import { setGradientStyle } from '@//services/utils';
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue3-toastify';
import FinalMaterialNeeds from "../components/planner/FinalMaterialNeeds.vue";
import { getWeaponField } from "../services/weaponHelper";
import WeaponDialog from "../components/weapon/WeaponDialog.vue";
import logger from '@/utils/logger';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();
const gameStore = useGameStore();

// ゲーム専用ダイアログコンポーネント (動的ロード)
const CharacterDialogComponent = computed(() => gameStore.getComponent('CharacterDialog'));

// 현재 게임의 폼 필드 (반응형)
const characterLevelItems = computed(() => gameStore.formFields?.characterLevelItems || []);
const characterActiveSkills = computed(() => gameStore.formFields?.characterActiveSkills || []);
const characterPassiveSkills = computed(() => gameStore.formFields?.characterPassiveSkills || []);
const weaponLevelItems = computed(() => gameStore.formFields?.weaponLevelItems || []);

// 현재 게임의 티어 재료 데이터
const tieredMaterials = computed(() => gameStore.getData('tiers') || {});

// goal이 캐릭터인지 확인 (WW: 42, EF: 52)
const isCharacterGoal = (goalId) => {
  const prefix = String(goalId).substring(0, 2);
  return prefix === '42' || prefix === '52'; // WW character or EF character
};

// goal이 무기인지 확인 (WW: 43, EF: 53)
const isWeaponGoal = (goalId) => {
  const prefix = String(goalId).substring(0, 2);
  return prefix === '43' || prefix === '53'; // WW weapon or EF weapon
};

const inventory = computed(() => inventoryStore.inventory);
const goals = computed(() => plannerStore.goals);
const checkGoals = computed(() => plannerStore.visibleGoals);

const dialogVisible = ref(false);
const dialogType = ref(null);
const selectedCharacter = ref(null);
const selectedWeapon = ref(null);

const currentSettings = ref(null);

// 媛?goal???④? ?곹깭瑜???ν븯??媛앹껜
const hiddenGoals = ref({});

const refreshKey = ref(0);

const expMaterialTypeStructure = {
  41601001: { exp_value: 100 },
  41601002: { exp_value: 200 },
  41601003: { exp_value: 500 },
  41601004: { exp_value: 1000 },
};

const filterProcessed = (materials) => {
  const { processed, ...filteredMaterials } = materials;
  return filteredMaterials;
};

const getMaterialIcon = (materialId) => {
  // Use getMaterialFieldById to search all categories at once without unnecessary warnings
  return getMaterialFieldById(materialId, "icon");
};

const getRawData = (id) => {
  // id??泥????먮━ 異붿텧
  const idStr = String(id);

  const prefix = idStr.substring(0, 2);
  logger.debug('Prefix:', prefix);

  // WW: 42=character, Endfield: 52=character
  const isCharacter = prefix === "42" || prefix === "52";

  if (isCharacter) {
    const character = getCharacterField(id);
    if (!character) return null;
    return toRaw(character);
  } else {
    const weapon = getWeaponField(id);
    if (!weapon) return null;
    return toRaw(weapon);
  }
};

// Debounced function to update materials
const debouncedUpdateMaterial = useDebounceFn((id, quantity) => {

  inventoryStore.addMaterial(id, quantity); // ?낅뜲?댄듃 硫붿꽌???몄텧
    updateFinalMaterialNeeds(); // Recalculate Material Needs
    refreshFinalMaterialNeeds(); // Force refresh

  toast.success(`Item updated successfully: ${id}, Quantitiy: ${quantity}`, {
    position: 'bottom-center',
    autoClose: 2000,
    theme: 'dark',
  });

}, 1000);

const handleInventoryUpdate = ({ id, quantity }) => {
  debouncedUpdateMaterial(id, quantity);
};

watch(
  () => inventory.value,
  () => {
    logger.debug("Inventory updated. Recalculating...");
    updateFinalMaterialNeeds();
  },
  { deep: true }
);

const refreshFinalMaterialNeeds = () => {
  refreshKey.value++;
};

const updateFinalMaterialNeeds = () => {
  const totalNeeds = {};
  const ownedMaterials = { ...inventory.value };

  checkGoals.value.forEach((goal) => {
    Object.entries(goal.materials || {}).forEach(([materialId, qty]) => {
      totalNeeds[materialId] = (totalNeeds[materialId] || 0) + qty;
    });
  });

  logger.debug("Total Needs from Goals:", totalNeeds);

  logger.debug("Owned Materials:", ownedMaterials);

  const { final_needs, synthesis_results, synthesized_per_game_id,raw_needs } = calculateMaterials(
    ownedMaterials,
    tieredMaterials.value,
    totalNeeds
  );

  logger.debug("Synthesis Results:", synthesis_results);
  logger.debug("raw_needs:", raw_needs);

  const playerExpResults = calculatePlayerExp(
    totalNeeds.player_exp || 0,
    expMaterialTypeStructure,
    ownedMaterials
  );
  logger.debug("Player EXP Results:", playerExpResults);

  // Combine needs, synthesize, and owned materials
  const formattedResults = {};

  // Process all materials from totalNeeds (original needs from goals)
  Object.entries(totalNeeds).forEach(([materialId, needQty]) => {
    if (materialId === 'player_exp' || materialId === 'weapon_exp' || materialId === 'processed') {
      return; // Skip, handled separately
    }

    const label = getMaterialFieldById(materialId, 'label') || materialId;
    const category = getMaterialFieldById(materialId, 'Category') || '기타';
    const subcategory = getMaterialFieldById(materialId, 'SubCategory') || category;

    formattedResults[materialId] = {
      need: needQty,
      shortage: final_needs[materialId] || 0,
      synthesize: synthesized_per_game_id[materialId] || 0,
      owned: ownedMaterials[materialId] || 0,
      label,
      category,
      subcategory,
    };
  });

  // Add player_exp as a single category (FinalMaterialNeeds will handle individual potions)
  if (totalNeeds.player_exp && totalNeeds.player_exp > 0) {
    formattedResults['player_exp'] = {
      need: totalNeeds.player_exp,
      shortage: 0,
      synthesize: 0,
      owned: 0,
      label: 'Player EXP',
      category: 'player_exp',
      subcategory: 'player_exp',
    };
  }

  logger.debug("Final Material Needs:", formattedResults);

  return { materials: formattedResults, player_exp: playerExpResults, totalResin: 0, totalDays: 0 };
};

const finalMaterialNeeds = computed(() => {
  const totalNeeds = {};
  const ownedMaterials = { ...inventory.value };

  checkGoals.value.forEach((goal) => {
    Object.entries(goal.materials || {}).forEach(([materialId, qty]) => {
      totalNeeds[materialId] = (totalNeeds[materialId] || 0) + qty;
    });
  });

  logger.debug("Total Needs from Goals:", totalNeeds);

  logger.debug("Owned Materials:", ownedMaterials);

  const { final_needs, synthesis_results, synthesized_per_game_id, raw_needs } = calculateMaterials(
    ownedMaterials,
    tieredMaterials.value,
    totalNeeds
  );

  logger.debug("Synthesis Results:", synthesis_results);
  logger.debug("raw_needs:", raw_needs);

  const playerExpResults = calculatePlayerExp(
    totalNeeds.player_exp || 0,
    expMaterialTypeStructure,
    ownedMaterials
  );
  logger.debug("Player EXP Results:", playerExpResults);

  // Combine needs, synthesize, and owned materials
  const formattedResults = {};

  // Process all materials from totalNeeds (original needs from goals)
  Object.entries(totalNeeds).forEach(([materialId, needQty]) => {
    if (materialId === 'player_exp' || materialId === 'weapon_exp' || materialId === 'processed') {
      return; // Skip, handled separately
    }

    const label = getMaterialFieldById(materialId, 'label') || materialId;
    const category = getMaterialFieldById(materialId, 'Category') || '기타';
    const subcategory = getMaterialFieldById(materialId, 'SubCategory') || category;

    formattedResults[materialId] = {
      need: needQty,
      shortage: final_needs[materialId] || 0,
      synthesize: synthesized_per_game_id[materialId] || 0,
      owned: ownedMaterials[materialId] || 0,
      label,
      category,
      subcategory,
    };
  });

  // Add player_exp as a single category (FinalMaterialNeeds will handle individual potions)
  if (totalNeeds.player_exp && totalNeeds.player_exp > 0) {
    formattedResults['player_exp'] = {
      need: totalNeeds.player_exp,
      shortage: 0,
      synthesize: 0,
      owned: 0,
      label: 'Player EXP',
      category: 'player_exp',
      subcategory: 'player_exp',
    };
  }

  logger.debug("Final Material Needs:", formattedResults);

  return { materials: formattedResults, player_exp: playerExpResults, totalResin: 0, totalDays: 0 };

});

const openDialog = (goal) => {
  logger.debug("Open dialog for goal:", goal);

  if (String(goal.id).startsWith("42")) {
    dialogType.value = "character";
    selectedWeapon.value = null;
    selectedCharacter.value = getCharacterField(goal.id);

    currentSettings.value = selectedCharacter.value ? plannerStore.characterSettings[selectedCharacter.value.game_id] : null
  }

  else {
    dialogType.value = "weapon";
    selectedCharacter.value = null;
    selectedWeapon.value = getWeaponField(goal.id);

    currentSettings.value = selectedWeapon.value ? plannerStore.weaponSettings[selectedWeapon.value.game_id] : null
  }

  logger.debug('Selected Character:', selectedCharacter.value, 'or Selected Weapon:', selectedWeapon.value);
  logger.debug('Current Setting:', currentSettings.value);
  logger.debug('Dialog Visible:', dialogVisible.value);

  dialogVisible.value = true;
};

// Remove goal
const removeGoal = (id, type) => {
  plannerStore.removeGoal(id, type);
};

// Hide goal
const hideGoal = (id, type) => {
  if (!hiddenGoals.value[id]) {
    plannerStore.hideGoal(id, type);
    hiddenGoals.value[id] = true;
  }
  else {
    plannerStore.revealGoal(id, type);
    hiddenGoals.value[id] = false;
  }
};

const updateCharacter = () => {
  if (!selectedCharacter.value) return;

  const characterId = selectedCharacter.value.game_id;

  // Update settings
  plannerStore.updateCharacterSettings(characterId, currentSettings.value);

  logger.debug('Updated Settings:', currentSettings.value);

  // ?щ즺 怨꾩궛 諛?紐⑺몴 ?낅뜲?댄듃
  const calculatedMaterials = plannerStore.calculateAllMaterials(characterId, "character");

  plannerStore.addGoal({
    id: selectedCharacter.value.game_id,
    type: 'character',
    materials: calculatedMaterials,
  });

  logger.debug('Updated Goals:', plannerStore.goals);
};

// Update weapon
const updateweapon = () => {
  if (!selectedWeapon.value) return;

  const weaponId = selectedWeapon.value.game_id;

  // Update settings
  plannerStore.updateWeaponSettings(weaponId, currentSettings.value);

  logger.debug('Updated Settings:', currentSettings.value);

  // ?щ즺 怨꾩궛 諛?紐⑺몴 ?낅뜲?댄듃
  const calculatedMaterials = plannerStore.calculateAllMaterials(weaponId, "weapon");

  plannerStore.addGoal({
    id: selectedWeapon.value.game_id,
    type: 'weapon',
    materials: calculatedMaterials,
  });

  logger.debug('Updated Goals:', plannerStore.goals);
};

/**
 * Validate if materials can be satisfied with current inventory and synthesis.
 * Returns validation result with shortages and synthesis plan.
 */
const validateMaterialsWithSynthesis = (requiredMaterials, currentInventory, tieredMaterialsData) => {
  const inventoryCopy = { ...currentInventory };
  const synthesisNeeded = [];
  const shortages = [];

  // Process each required material
  for (const [materialId, requiredQty] of Object.entries(requiredMaterials)) {
    if (materialId === 'processed') continue;

    // Skip player_exp and weapon_exp - they use special calculation logic
    if (materialId === 'player_exp' || materialId === 'weapon_exp') {
      // Calculate if player exp is sufficient using the same logic as calculatePlayerExp
      if (materialId === 'player_exp') {
        const totalExpAvailable =
          (currentInventory[41601001] || 0) * 1000 +
          (currentInventory[41601002] || 0) * 3000 +
          (currentInventory[41601003] || 0) * 8000 +
          (currentInventory[41601004] || 0) * 20000;

        if (totalExpAvailable < requiredQty) {
          shortages.push({
            materialId,
            materialName: 'Player EXP',
            needed: requiredQty - totalExpAvailable,
          });
        }
      }
      continue;
    }

    const available = inventoryCopy[materialId] || 0;

    if (available >= requiredQty) {
      // Sufficient materials available directly
      continue;
    }

    // Check if this material can be synthesized from lower tiers
    const shortage = requiredQty - available;
    const subcategory = getMaterialFieldById(materialId, 'SubCategory');

    if (!subcategory || !tieredMaterialsData[subcategory]) {
      // Cannot synthesize, mark as shortage
      shortages.push({
        materialId,
        materialName: getMaterialFieldById(materialId, 'label') || materialId,
        needed: shortage,
      });
      continue;
    }

    // Find the tier of this material
    const materialTierData = tieredMaterialsData[subcategory];
    let currentTier = null;
    for (const [tier, data] of Object.entries(materialTierData)) {
      if (data.game_id === parseInt(materialId)) {
        currentTier = parseInt(tier);
        break;
      }
    }

    if (!currentTier || currentTier === 1) {
      // Tier 1 materials cannot be synthesized from lower tiers
      shortages.push({
        materialId,
        materialName: getMaterialFieldById(materialId, 'label') || materialId,
        needed: shortage,
      });
      continue;
    }

    // Try to synthesize from lower tiers
    let remainingShortage = shortage;
    const synthesisSteps = [];

    // Check each lower tier
    for (let tier = currentTier - 1; tier >= 1; tier--) {
      if (remainingShortage <= 0) break;

      const lowerTierMaterial = materialTierData[tier];
      if (!lowerTierMaterial) continue;

      const lowerTierGameId = lowerTierMaterial.game_id;
      const lowerTierAvailable = inventoryCopy[lowerTierGameId] || 0;
      const synthesisRatio = lowerTierMaterial.synthesizable?.count || 3;

      // Calculate how many we can synthesize from this tier
      const neededFromThisTier = remainingShortage * Math.pow(synthesisRatio, currentTier - tier);
      const canSynthesize = Math.floor(lowerTierAvailable / synthesisRatio);

      if (canSynthesize > 0) {
        const willSynthesize = Math.min(canSynthesize, Math.ceil(neededFromThisTier / Math.pow(synthesisRatio, currentTier - tier - 1)));

        synthesisSteps.push({
          fromMaterialId: lowerTierGameId,
          toMaterialId: materialId,
          fromTier: tier,
          toTier: currentTier,
          quantity: willSynthesize,
          ratio: synthesisRatio,
        });

        inventoryCopy[lowerTierGameId] -= willSynthesize * synthesisRatio;
        const synthesizedAmount = Math.floor(willSynthesize / Math.pow(synthesisRatio, currentTier - tier - 1));
        remainingShortage -= synthesizedAmount;
      }
    }

    if (remainingShortage > 0) {
      // Still short after attempting synthesis
      shortages.push({
        materialId,
        materialName: getMaterialFieldById(materialId, 'label') || materialId,
        needed: remainingShortage,
      });
    }

    if (synthesisSteps.length > 0) {
      synthesisNeeded.push({
        materialId,
        materialName: getMaterialFieldById(materialId, 'label') || materialId,
        steps: synthesisSteps,
      });
    }
  }

  const canComplete = shortages.length === 0;

  return {
    canComplete,
    shortages,
    synthesisNeeded,
  };
};

/**
 * Perform material synthesis based on synthesis plan.
 */
const performSynthesis = (synthesisNeeded) => {
  for (const { materialId, materialName, steps } of synthesisNeeded) {
    for (const step of steps) {
      const { fromMaterialId, toMaterialId, quantity, ratio } = step;

      // Deduct lower tier materials
      const usedQty = quantity * ratio;
      inventoryStore.removeMaterial(fromMaterialId, usedQty);

      // Add higher tier materials
      inventoryStore.addMaterial(toMaterialId, quantity);

      logger.info(`Synthesized ${quantity}x ${getMaterialFieldById(toMaterialId, 'label')} from ${usedQty}x ${getMaterialFieldById(fromMaterialId, 'label')}`);
    }
  }
};

// Complete goal: Update current levels to target and deduct materials from inventory
const completeGoal = (id, type) => {
  const goal = goals.value.find(g => g.id === id);
  if (!goal) {
    toast.error('Goal not found');
    return;
  }

  const entityName = type === 'character'
    ? getCharacterField(id, 'display_name')
    : getWeaponField(id, 'display_name');

  try {
    // Get current settings
    const settings = type === 'character'
      ? plannerStore.characterSettings[id]
      : plannerStore.weaponSettings[id];

    if (!settings) {
      toast.error('Settings not found for this goal');
      return;
    }

    // Validate materials with synthesis check
    const validation = validateMaterialsWithSynthesis(
      goal.materials || {},
      inventory.value,
      tieredMaterials.value
    );

    if (!validation.canComplete) {
      // Show detailed shortage message
      const shortageDetails = validation.shortages
        .map(s => `  • ${s.materialName}: Need ${s.needed} more`)
        .join('\n');

      toast.error(`Insufficient materials!\n\n${shortageDetails}`, {
        position: 'top-center',
        autoClose: 5000,
      });

      logger.warn('Cannot complete goal due to material shortage:', validation.shortages);
      return;
    }

    // Show confirmation with synthesis info if needed
    let confirmMessage = `Complete goal for ${entityName}?\n\nThis will:\n- Update current level/skills to target\n- Deduct required materials from inventory`;

    if (validation.synthesisNeeded.length > 0) {
      confirmMessage += '\n\nAuto-synthesis will be performed:';
      validation.synthesisNeeded.forEach(syn => {
        confirmMessage += `\n• ${syn.materialName} (from lower tier materials)`;
      });
    }

    confirmMessage += '\n- Hide this goal from planner\n\nContinue?';

    if (!confirm(confirmMessage)) {
      return;
    }

    // Perform synthesis if needed
    if (validation.synthesisNeeded.length > 0) {
      logger.info('Performing auto-synthesis before goal completion');
      performSynthesis(validation.synthesisNeeded);
      toast.info('Materials synthesized automatically', {
        position: 'bottom-center',
        autoClose: 2000,
      });
    }

    // Update current levels to match target
    if (type === 'character') {
      const updatedSettings = {
        ...settings,
        currentLevel: settings.targetLevel,
        activeSkills: {}
      };

      // Update active skills current to target
      Object.keys(settings.activeSkills).forEach(key => {
        if (key.endsWith('_current_level')) {
          const targetKey = key.replace('_current_level', '_target_level');
          updatedSettings.activeSkills[key] = settings.activeSkills[targetKey];
        } else {
          updatedSettings.activeSkills[key] = settings.activeSkills[key];
        }
      });

      // Update passive skills current to target (新構造: レベルベース 0→2)
      updatedSettings.passiveSkills = {};
      Object.keys(settings.passiveSkills || {}).forEach(key => {
        if (key.endsWith('_current_level')) {
          const targetKey = key.replace('_current_level', '_target_level');
          updatedSettings.passiveSkills[key] = settings.passiveSkills[targetKey];
        } else {
          updatedSettings.passiveSkills[key] = settings.passiveSkills[key];
        }
      });

      plannerStore.updateCharacterSettings(id, updatedSettings);
      logger.info(`Updated character ${id} settings to target levels`);
    } else {
      // Weapon only has levels
      const updatedSettings = {
        ...settings,
        currentLevel: settings.targetLevel
      };

      plannerStore.updateWeaponSettings(id, updatedSettings);
      logger.info(`Updated weapon ${id} settings to target level`);
    }

    // Deduct materials from inventory
    Object.entries(goal.materials || {}).forEach(([materialId, quantity]) => {
      if (materialId === 'processed') return; // Skip processed marker

      // Special handling for player_exp - deduct from individual potions
      if (materialId === 'player_exp') {
        let remainingExp = quantity;
        const potions = [
          { id: 41601004, value: 20000 }, // Largest first
          { id: 41601003, value: 8000 },
          { id: 41601002, value: 3000 },
          { id: 41601001, value: 1000 },
        ];

        for (const potion of potions) {
          const available = inventory.value[potion.id] || 0;
          const needed = Math.ceil(remainingExp / potion.value);
          const toUse = Math.min(available, needed);

          if (toUse > 0) {
            inventoryStore.removeMaterial(potion.id, toUse);
            remainingExp -= toUse * potion.value;
            logger.debug(`Deducted ${toUse}x ${getMaterialFieldById(potion.id, 'label')} (${toUse * potion.value} exp)`);
          }

          if (remainingExp <= 0) break;
        }

        if (remainingExp > 0) {
          logger.warn(`Could not deduct all player_exp: ${remainingExp} exp remaining`);
        }
        return;
      }

      // Special handling for weapon_exp - deduct from individual cores
      if (materialId === 'weapon_exp') {
        let remainingExp = quantity;
        const cores = [
          { id: 41701004, value: 20000 },
          { id: 41701003, value: 8000 },
          { id: 41701002, value: 3000 },
          { id: 41701001, value: 1000 },
        ];

        for (const core of cores) {
          const available = inventory.value[core.id] || 0;
          const needed = Math.ceil(remainingExp / core.value);
          const toUse = Math.min(available, needed);

          if (toUse > 0) {
            inventoryStore.removeMaterial(core.id, toUse);
            remainingExp -= toUse * core.value;
            logger.debug(`Deducted ${toUse}x ${getMaterialFieldById(core.id, 'label')} (${toUse * core.value} exp)`);
          }

          if (remainingExp <= 0) break;
        }

        if (remainingExp > 0) {
          logger.warn(`Could not deduct all weapon_exp: ${remainingExp} exp remaining`);
        }
        return;
      }

      // Normal materials
      inventoryStore.removeMaterial(materialId, quantity);
      logger.debug(`Deducted ${quantity} of ${materialId} from inventory`);
    });

    // Hide the goal
    plannerStore.hideGoal(id, type);
    hiddenGoals.value[id] = true;

    // Recalculate materials (goal should now show 0 materials needed)
    const calculatedMaterials = plannerStore.calculateAllMaterials(id, type);
    plannerStore.addGoal({
      id: id,
      type: type,
      materials: calculatedMaterials,
    });

    toast.success(`Goal completed for ${entityName}!`, {
      position: 'bottom-center',
      autoClose: 3000,
      theme: 'dark',
    });

    logger.info(`Goal completed for ${type} ${id}`);
  } catch (error) {
    logger.error('Error completing goal:', error);
    toast.error('Failed to complete goal. Check console for details.');
  }
};

onMounted(() => {
  logger.debug('goals', goals);

});
</script>

<style>
.goals-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.goal-border {
  border-radius: 12px;
  padding: 13px;
  background-clip: border-box;
  position: relative;
}

.goal-border.hidden {
  filter: grayscale(100%) !important; /* ?묐갚 泥섎━ */
  opacity: 0.6 !important; /* Reduced opacity */
}
.goal-card {
  background-color: #f4f4f4;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.goal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  /* Additional spacing between icons */
}

.character-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 8px;
}

.icon-container {
  display: flex;
  /* Flexbox for icon alignment */
  align-items: center;
  /* Vertical center alignment */
  justify-content: flex-start;
  /* ?쇱そ ?뺣젹 (?먰븯??寃쎌슦 center濡?蹂寃?媛?? */
  flex-wrap: nowrap;
  /* Force single line alignment */
  gap: 8px;
  /* Icon spacing */
}

.icon-6 {
  width: 24px;
  height: 24px;
  color: #333;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.icon-6:hover {
  transform: scale(1.1);
  /* 留덉슦???ㅻ쾭 ???뺣? */
  opacity: 0.8;
  /* 留덉슦???ㅻ쾭 ??諛섑닾紐?*/
}

.delete-button,
.hide-button,
.edit-button,
.complete-button {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Center icon alignment */
  cursor: pointer;
  /* ?대┃ 媛?ν븳 紐⑥뼇 */
}

.delete-button:hover,
.hide-button:hover,
.edit-button:hover,
.complete-button:hover {
  opacity: 0.8;
  /* 留덉슦???ㅻ쾭 ??諛섑닾紐?*/
}

.goal-materials {
  margin-top: 12px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.material-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.material-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.material-info {
  text-align: center;
  font-size: 12px;
  color: #333;
  font-weight: bold;
}

.material-quantity {
  color: black;
  padding: 2px 6px;
  font-size: 12px;
}

.complete-button .icon-6 {
  color: #4caf50;
}

.complete-button:hover .icon-6 {
  color: #45a049;
}
</style>

