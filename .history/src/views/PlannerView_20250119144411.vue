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
            <!-- 캐릭터 이름과 아이콘 -->
            <div class="goal-header">
              <div class="character-container"
                v-if="String(goal.id).startsWith('42')">
                <img :src="getCharacterField(goal.id, 'icon')" alt="Character Icon" class="character-icon" />
                <h3>{{ getCharacterField(goal.id, 'display_name') }}</h3>
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
                </div>
              </div>
              <div class="weapon-container" v-else>
                <img :src="getWeaponField(goal.id, 'icon')" alt="Weapon Icon" class="character-icon" />
                <h3>{{ getWeaponField(goal.id, 'display_name') }}</h3>
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
                </div>
              </div>
            </div>

            <!-- 재료 리스트 -->
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

    <FinalMaterialNeeds :materials="finalMaterialNeeds" :key="refreshKey" @updateInventory="handleInventoryUpdate" />

    <ChracterDialog v-if="dialogVisible && dialogType === 'character' && selectedCharacter" :visible="dialogVisible"
      :character="selectedCharacter" :settings="currentSettings" :levelItems="characterLevelItems"
      :activeSkills="characterActiveSkills" :passiveSkills="characterPassiveSkills" @close="dialogVisible = false"
      @updateCharacter="updateCharacter" />

    <WeaponDialog v-if="dialogVisible && dialogType === 'weapon' && selectedWeapon" :visible="dialogVisible"
      :weapon="selectedWeapon" :settings="currentSettings" :levelItems="weaponLevelItems" @close="dialogVisible = false"
      @updateweapon="updateweapon" />
  </div>
</template>

<script setup>
import { watch, computed, toRaw, onMounted, ref } from "vue";
import { usePlannerStore } from "@/store/planner";
import { useInventoryStore } from "@/store/inventory";
import {
  findMaterial,
  getMaterialField,
  calculatePlayerExp,
  calculateMaterials,
} from "@/services/materialHelper";
import { tieredMaterials } from "@/data/tieredMaterials";
import { getCharacterField } from "@/services/characterHelper";
import { setGradientStyle } from '@//services/utils';
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue3-toastify';
import FinalMaterialNeeds from "../components/planner/FinalMaterialNeeds.vue";
import { getWeaponField } from "../services/weaponHelper";
import ChracterDialog from "../components/character/ChracterDialog.vue";
import WeaponDialog from "../components/weapon/WeaponDialog.vue";
import { characterLevelItems, characterActiveSkills, characterPassiveSkills } from '../data/formCharacters';
import { weaponLevelItems } from '../data/formweapons';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();

const inventory = computed(() => inventoryStore.inventory);
const goals = computed(() => plannerStore.goals);
const checkGoals = computed(() => plannerStore.visibleGoals);

const dialogVisible = ref(false);
const dialogType = ref(null);
const selectedCharacter = ref(null);
const selectedWeapon = ref(null);

const currentSettings = ref(null);

// 각 goal의 숨김 상태를 저장하는 객체
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
  const types = [
    "common",
    "ascension",
    "boss",
    "weeklyBoss",
    "player_exp",
    "weapon_exp",
    "forgery",
    "credit",
  ];
  for (const type of types) {
    const material = findMaterial(type, materialId, null, true);
    if (material) {
      return getMaterialField(material, "icon");
    }
  }
  return null;
};

const getRawData = (id) => {
  // id의 첫 두 자리 추출
  const idStr = String(id);

  const prefix = idStr.substring(0, 2); // 또는 id.slice(0, 2);
  console.log('Prefix:', prefix);

  if (prefix === "42") {
    const character = getCharacterField(id); // Retrieve character object
    if (!character) return null;

    return toRaw(character); // Remove Vue's reactive proxy
  }

  else {
    const weapon = getWeaponField(id);
    if (!weapon) return null;

    return toRaw(weapon);
  }
};

// 디바운스된 업데이트 함수 생성
const debouncedUpdateMaterial = useDebounceFn((id, quantity) => {

  inventoryStore.addMaterial(id, quantity); // 업데이트 메서드 호출
  updateFinalMaterialNeeds(); // Material Needs 재계산
  refreshFinalMaterialNeeds(); // 강제 재렌더링

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
    console.log("[Debug] Inventory updated. Recalculating...");
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

  console.log("[Debug] Total Needs from Goals:", totalNeeds);

  console.log("[Debug] Owned Materials:", ownedMaterials);

  const { final_needs, synthesis_results, synthesized_per_game_id } = calculateMaterials(
    ownedMaterials,
    tieredMaterials,
    totalNeeds
  );

  console.log("[Debug] Synthesis Results:", synthesis_results);

  const playerExpResults = calculatePlayerExp(
    totalNeeds.player_exp || 0,
    expMaterialTypeStructure,
    ownedMaterials
  );
  console.log("[Debug] Player EXP Results:", playerExpResults);

  // Combine needs, synthesize, and owned materials
  const formattedResults = {};

  Object.keys({ ...final_needs, ...synthesized_per_game_id }).forEach((gameId) => {
    formattedResults[gameId] = {
      need: final_needs[gameId] || 0,
      synthesize: synthesized_per_game_id[gameId] || 0,
      owned: ownedMaterials[gameId] || 0, // Add owned materials
    };
  });

  console.log("[Debug] Final Material Needs:", formattedResults);

  return { materials: formattedResults, player_exp: playerExpResults };
};

const finalMaterialNeeds = computed(() => {
  const totalNeeds = {};
  const ownedMaterials = { ...inventory.value };

  checkGoals.value.forEach((goal) => {
    Object.entries(goal.materials || {}).forEach(([materialId, qty]) => {
      totalNeeds[materialId] = (totalNeeds[materialId] || 0) + qty;
    });
  });

  console.log("[Debug] Total Needs from Goals:", totalNeeds);

  console.log("[Debug] Owned Materials:", ownedMaterials);

  const { final_needs, synthesis_results, synthesized_per_game_id } = calculateMaterials(
    ownedMaterials,
    tieredMaterials,
    totalNeeds
  );

  console.log("[Debug] Synthesis Results:", synthesis_results);

  const playerExpResults = calculatePlayerExp(
    totalNeeds.player_exp || 0,
    expMaterialTypeStructure,
    ownedMaterials
  );
  console.log("[Debug] Player EXP Results:", playerExpResults);

  // Combine needs, synthesize, and owned materials
  const formattedResults = {};

  Object.keys({ ...final_needs, ...synthesized_per_game_id }).forEach((gameId) => {
    formattedResults[gameId] = {
      need: final_needs[gameId] || 0,
      synthesize: synthesized_per_game_id[gameId] || 0,
      owned: ownedMaterials[gameId] || 0, // Add owned materials
    };
  });

  console.log("[Debug] Final Material Needs:", formattedResults);

  return { materials: formattedResults, player_exp: playerExpResults };

});

const openDialog = (goal) => {
  // 다이얼로그를 열 때 해당 캐릭터 정보를 전달
  console.log("Open dialog for goal:", goal);

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

  console.log(`[Debug] Selected Character: ${JSON.stringify(selectedCharacter.value)} or Selected Weapon: ${JSON.stringify(selectedWeapon.value)}`);
  console.log(`[Debug] Current Setting: ${JSON.stringify(currentSettings.value)}`);
  console.log(`[Debug] Dialog Visible: ${dialogVisible.value}`);


  dialogVisible.value = true;
};

// 숨김 해제
const removeGoal = (id, type) => {
  plannerStore.removeGoal(id, type);
};

// 숨김
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

  // 설정값 업데이트
  plannerStore.updateCharacterSettings(characterId, currentSettings.value);

  console.log('Updated Settings:', currentSettings.value);

  // 재료 계산 및 목표 업데이트
  const calculatedMaterials = plannerStore.calculateAllMaterials(characterId, "character");

  plannerStore.addGoal({
    id: selectedCharacter.value.game_id,
    type: 'character',
    materials: calculatedMaterials,
  });

  console.log('Updated Goals:', plannerStore.goals);
};

// 무기 업데이트
const updateweapon = () => {
  if (!selectedWeapon.value) return;

  const weaponId = selectedWeapon.value.game_id;

  // 설정값 업데이트
  plannerStore.updateWeaponSettings(weaponId, currentSettings.value);

  console.log('Updated Settings:', currentSettings.value);

  // 재료 계산 및 목표 업데이트
  const calculatedMaterials = plannerStore.calculateAllMaterials(weaponId, "weapon");

  plannerStore.addGoal({
    id: selectedWeapon.value.game_id,
    type: 'weapon',
    materials: calculatedMaterials,
  });

  console.log('Updated Goals:', plannerStore.goals);
};


onMounted(() => {
  console.log('goals', goals);

  goals = plannerStore.loadGoals(plannerStore.currentGameId);
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
  filter: grayscale(100%) !important; /* 흑백 처리 */
  opacity: 0.6 !important; /* 약간 투명 */
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
  /* 아이템 간 간격 추가 */
}

.character-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 8px;
}

.icon-container {
  display: flex;
  /* 아이콘 정렬을 위한 플렉스 박스 */
  align-items: center;
  /* 세로 중앙 정렬 */
  justify-content: flex-start;
  /* 왼쪽 정렬 (원하는 경우 center로 변경 가능) */
  flex-wrap: nowrap;
  /* 한 줄로 강제 정렬 */
  gap: 8px;
  /* 아이콘 간격 */
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
  /* 마우스 오버 시 확대 */
  opacity: 0.8;
  /* 마우스 오버 시 반투명 */
}

.delete-button,
.hide-button,
.edit-button {
  background: none;
  /* 배경 제거 */
  border: none;
  /* 테두리 제거 */
  padding: 0;
  /* 버튼 여백 제거 */
  display: flex;
  /* 버튼 내부에 아이콘 정렬 */
  align-items: center;
  /* 아이콘 수직 정렬 */
  justify-content: center;
  /* 아이콘 수평 정렬 */
  cursor: pointer;
  /* 클릭 가능한 모양 */
}

.delete-button:hover,
.hide-button:hover,
.edit-button:hover {
  opacity: 0.8;
  /* 마우스 오버 시 반투명 */
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


</style>