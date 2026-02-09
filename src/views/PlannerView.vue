<template>
  <div>
    <h1>{{ tUI('planner.title') }}</h1>
    <div>
      <h2>{{ tUI('planner.goals') }}</h2>
      <div class="goals-container">
        <div class="goal-border" v-for="goal in goals" :key="goal.name"
          :class="{ hidden: goal.isHidden }"
          :style="setGradientStyle(getRawData(goal), true)">
          <div class="goal-card">
            <!-- Icon -->
            <div class="card-icon-wrapper">
              <img
                v-if="goal.type === 'character'"
                :src="getCharacterField(goal.id, 'icon')"
                alt="Character Icon"
                class="card-icon"
              />
              <img
                v-else
                :src="getWeaponField(goal.id, 'icon')"
                alt="Weapon Icon"
                class="card-icon"
              />
            </div>

            <!-- Name -->
            <h3 class="card-name">
              <template v-if="goal.type === 'character'">
                {{ tCharacter(goal.id, getCharacterField(goal.id, 'display_name')) }}
              </template>
              <template v-else>
                {{ tWeapon(goal.id, getWeaponField(goal.id, 'display_name')) }}
              </template>
            </h3>

            <!-- Action buttons -->
            <div class="card-actions">
              <button class="action-btn edit-btn" @click="openDialog(goal)" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
              <button class="action-btn hide-btn" @click="hideGoal(goal.id, goal.type)" title="Hide">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
              <button class="action-btn complete-btn" @click="completeGoal(goal.id, goal.type)" title="Complete">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </button>
              <button class="action-btn delete-btn" @click="removeGoal(goal.id, goal.type)" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
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
const { tCharacter, tWeapon, tMaterial, tUI } = useLocale();
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

// 動的expカテゴリ検出: materials.jsonでvalueフィールドを持つカテゴリを自動検出
const expCategories = computed(() => {
  const materials = gameStore.getData('materials') || {};
  const result = {};

  // 全カテゴリをスキャンしてvalueフィールドを持つものをexp扱い
  Object.entries(materials).forEach(([categoryName, categoryData]) => {
    // カテゴリ内の最初のアイテムをチェック
    const firstItem = Object.values(categoryData || {})[0];
    if (firstItem && typeof firstItem.value === 'number') {
      // このカテゴリはexpカテゴリ
      result[categoryName] = Object.values(categoryData)
        .filter(m => m.game_id && m.value)
        .map(m => ({ id: m.game_id, value: m.value }))
        .sort((a, b) => b.value - a.value); // 大きい順
    }
  });

  return result;
});

// expカテゴリかどうかを判定
const isExpCategory = (categoryName) => {
  return categoryName in expCategories.value;
};

// 特定expカテゴリの材料リスト取得
const getExpMaterials = (categoryName) => {
  return expCategories.value[categoryName] || [];
};

// calculatePlayerExp用のオブジェクト形式 { game_id: { exp_value } } (player_exp用、互換性維持)
const expMaterialTypeStructure = computed(() => {
  const result = {};
  const playerExpMats = expCategories.value['player_exp'] || [];
  playerExpMats.forEach(m => {
    result[m.id] = { exp_value: m.value };
  });
  return result;
});

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


const getRawData = (goal) => {
  // id??泥????먮━ 異붿텧
  // goal.typeを使用してキャラクター/武器を判別 (ゲーム共通)
  if (goal.type === 'character') {
    const character = getCharacterField(goal.id);
    if (!character) return null;
    return toRaw(character);
  } else {
    const weapon = getWeaponField(goal.id);
    if (!weapon) return null;
    return toRaw(weapon);
  }
};

// Queue for pending material updates (handles multiple rapid inputs)
const pendingUpdates = ref(new Map());

// Flush all pending updates after debounce
const flushPendingUpdates = useDebounceFn(() => {
  const updates = pendingUpdates.value;
  if (updates.size === 0) return;

  // Apply all pending updates
  updates.forEach((quantity, id) => {
    inventoryStore.addMaterial(id, quantity);
  });

  // Show single toast for batch update
  const count = updates.size;
  toast.success(`${count} item${count > 1 ? 's' : ''} updated successfully`, {
    position: 'bottom-center',
    autoClose: 2000,
    theme: 'dark',
  });

  // Clear pending updates
  pendingUpdates.value = new Map();

  // Recalculate after all updates applied
  updateFinalMaterialNeeds();
  refreshFinalMaterialNeeds();
}, 1000);

const handleInventoryUpdate = ({ id, quantity }) => {
  // Queue the update (overwrites previous value for same id)
  pendingUpdates.value.set(id, quantity);
  // Trigger debounced flush
  flushPendingUpdates();
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
    expMaterialTypeStructure.value,
    ownedMaterials
  );
  logger.debug("Player EXP Results:", playerExpResults);

  // Combine needs, synthesize, and owned materials
  const formattedResults = {};

  // Process all materials from totalNeeds (original needs from goals)
  Object.entries(totalNeeds).forEach(([materialId, needQty]) => {
    // expカテゴリとprocessedはスキップ (動的判定)
    if (isExpCategory(materialId) || materialId === 'processed') {
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

  // 動的expカテゴリ追加 (FinalMaterialNeedsが個別アイテムを処理)
  Object.keys(expCategories.value).forEach((expCategoryName) => {
    if (totalNeeds[expCategoryName] && totalNeeds[expCategoryName] > 0) {
      formattedResults[expCategoryName] = {
        need: totalNeeds[expCategoryName],
        shortage: 0,
        synthesize: 0,
        owned: 0,
        label: expCategoryName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), // snake_case → Title Case
        category: expCategoryName,
        subcategory: expCategoryName,
      };
    }
  });

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
    expMaterialTypeStructure.value,
    ownedMaterials
  );
  logger.debug("Player EXP Results:", playerExpResults);

  // Combine needs, synthesize, and owned materials
  const formattedResults = {};

  // Process all materials from totalNeeds (original needs from goals)
  Object.entries(totalNeeds).forEach(([materialId, needQty]) => {
    // expカテゴリとprocessedはスキップ (動的判定)
    if (isExpCategory(materialId) || materialId === 'processed') {
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

  // 動的expカテゴリ追加 (FinalMaterialNeedsが個別アイテムを処理)
  Object.keys(expCategories.value).forEach((expCategoryName) => {
    if (totalNeeds[expCategoryName] && totalNeeds[expCategoryName] > 0) {
      formattedResults[expCategoryName] = {
        need: totalNeeds[expCategoryName],
        shortage: 0,
        synthesize: 0,
        owned: 0,
        label: expCategoryName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        category: expCategoryName,
        subcategory: expCategoryName,
      };
    }
  });

  logger.debug("Final Material Needs:", formattedResults);

  return { materials: formattedResults, player_exp: playerExpResults, totalResin: 0, totalDays: 0 };

});

const openDialog = (goal) => {
  logger.debug("Open dialog for goal:", goal);

  // goal.typeを使用してキャラクター/武器を判別 (ゲーム共通)
  if (goal.type === "character") {
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

// Hide goal (toggle)
const hideGoal = (id, type) => {
  const goal = goals.value.find(g => g.id === id && g.type === type);
  if (!goal) return;

  if (!goal.isHidden) {
    plannerStore.hideGoal(id, type);
  } else {
    plannerStore.revealGoal(id, type);
  }

  // Estimated Planner部分を即座に更新
  refreshFinalMaterialNeeds();
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

    // 動的expカテゴリ判定 - 特別な計算ロジック使用
    if (isExpCategory(materialId)) {
      const expMats = getExpMaterials(materialId);
      const totalExpAvailable = expMats.reduce((sum, m) => {
        return sum + (currentInventory[m.id] || 0) * m.value;
      }, 0);

      if (totalExpAvailable < requiredQty) {
        shortages.push({
          materialId,
          materialName: materialId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          needed: requiredQty - totalExpAvailable,
        });
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
  const operations = [];

  for (const { materialId, materialName, steps } of synthesisNeeded) {
    for (const step of steps) {
      const { fromMaterialId, toMaterialId, quantity, ratio } = step;

      // Queue deduction of lower tier materials
      const usedQty = quantity * ratio;
      operations.push({ materialId: fromMaterialId, quantity: usedQty, operation: 'remove' });

      // Queue addition of higher tier materials
      operations.push({ materialId: toMaterialId, quantity, operation: 'add' });

      logger.info(`Synthesized ${quantity}x ${getMaterialFieldById(toMaterialId, 'label')} from ${usedQty}x ${getMaterialFieldById(fromMaterialId, 'label')}`);
    }
  }

  // Apply all synthesis operations in one batch
  inventoryStore.batchUpdateMaterials(operations);
};

// Complete goal: Update current levels to target and deduct materials from inventory
const completeGoal = (id, type) => {
  const goal = goals.value.find(g => g.id === id && g.type === type);
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
      Object.keys(settings.activeSkills || {}).forEach(key => {
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

    // Deduct materials from inventory (batch for performance)
    const materialsToRemove = [];

    Object.entries(goal.materials || {}).forEach(([materialId, quantity]) => {
      if (materialId === 'processed') return; // Skip processed marker

      // 動的expカテゴリ処理: 個別のアイテムから差し引く
      if (isExpCategory(materialId)) {
        let remainingExp = quantity;
        const expMats = getExpMaterials(materialId); // 既にvalue降順でソート済み

        for (const item of expMats) {
          const available = inventory.value[item.id] || 0;
          const needed = Math.ceil(remainingExp / item.value);
          const toUse = Math.min(available, needed);

          if (toUse > 0) {
            materialsToRemove.push({ materialId: item.id, quantity: toUse });
            remainingExp -= toUse * item.value;
            logger.debug(`Queued deduction: ${toUse}x ${getMaterialFieldById(item.id, 'label')} (${toUse * item.value} exp)`);
          }

          if (remainingExp <= 0) break;
        }

        if (remainingExp > 0) {
          logger.warn(`Could not deduct all ${materialId}: ${remainingExp} exp remaining`);
        }
        return;
      }

      // Normal materials
      materialsToRemove.push({ materialId, quantity });
      logger.debug(`Queued deduction: ${quantity} of ${materialId}`);
    });

    // Apply all deductions in one batch (single localStorage save)
    inventoryStore.batchRemoveMaterials(materialsToRemove);

    // Hide the goal
    plannerStore.hideGoal(id, type);

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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.goal-border {
  border-radius: 12px;
  padding: 4px;
  background-clip: border-box;
  position: relative;
  aspect-ratio: 1 / 1;
}

.goal-border.hidden {
  filter: grayscale(100%) !important;
  opacity: 0.6 !important;
}

.goal-card {
  background-color: #f4f4f4;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.card-icon-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.card-icon {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
}

.card-name {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin: 8px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 0 0 auto;
  max-height: 30px;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex: 0 0 auto;
}

.action-btn {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn svg {
  width: 16px;
  height: 16px;
  color: #333;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.action-btn.edit-btn:hover svg {
  color: #4a90e2;
}

.action-btn.hide-btn:hover svg {
  color: #666;
}

.action-btn.complete-btn:hover svg {
  color: #4caf50;
}

.action-btn.delete-btn:hover svg {
  color: #e53935;
}
</style>
