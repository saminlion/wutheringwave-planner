<template>
  <div>
    <h1>Planner</h1>
    <div>
      <h2>Goals</h2>
      <div class="goals-container">
        <div class="goal-border" v-for="goal in goals" :key="goal.name"
          :style="setGradientStyle(getRawData(goal.id), true)">
          <div class="goal-card">
            <!-- 캐릭터 이름과 아이콘 -->
            <div class="goal-header">
              <div v-if="String(goal.id).startsWith('42')">
                <img :src="getCharacterField(goal.id, 'icon')" alt="Character Icon" class="character-icon" />
              <h3>{{ getCharacterField(goal.id, 'display_name') }}</h3>
            </div>
            <div v-else>
              <img :src="getWeaponField(goal.id, 'icon')" alt="Weapon Icon" class="character-icon" />
              <h3>{{ getWeaponField(goal.id, 'display_name') }}</h3>
            </div>
              <button class="edit-button" @click="openDialog(goal)">
                ✎
              </button>
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

    <div>
      <h2>Inventory</h2>
      <ul>
        <li v-for="(qty, mat) in inventory" :key="mat">
          {{ mat }}: {{ qty }}
        </li>
      </ul>
    </div>

    <FinalMaterialNeeds
    :materials="finalMaterialNeeds"
    :key="refreshKey"
    @updateInventory="handleInventoryUpdate" />
    
<ChracterDialog  v-if="dialogVisible && dialogType === 'character' && selectedCharacter" :visible="dialogVisible" :character="selectedCharacter"
      :settings="currentSettings" :levelItems="characterLevelItems" :activeSkills="characterActiveSkills" :passiveSkills="characterPassiveSkills"
      @close="dialogVisible = false" @updateCharacter="updateCharacter"/>

      <WeaponDialog v-if="dialogVisible && dialogType === 'weapon' && selectedWeapon" :visible="dialogVisible" :weapon="selectedweapon"
        :settings="currentSettings" :levelItems="weaponLevelItems"
        @close="dialogVisible = false" @updateweapon="updateweapon" />
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
import FinalMaterialNeeds from "../components/planner/FinalMaterialNeeds.vue";
import { getWeaponField } from "../services/weaponHelper";
import ChracterDialog from "../components/character/ChracterDialog.vue";
import WeaponDialog from "../components/weapon/WeaponDialog.vue";
import { characterLevelItems, characterActiveSkills, characterPassiveSkills } from '../data/formCharactersNew';
import { weaponLevelItems } from '../data/formweaponsNew';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();

const inventory = computed(() => inventoryStore.inventory);
const goals = computed(() => plannerStore.goals);

const dialogVisible = ref(false);
const dialogType = ref(null);
const selectedCharacter = ref(null);
const selectedweapon = ref(null);

const currentSettings = ref(null);

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

  if (prefix === "42")
{
  const character = getCharacterField(id); // Retrieve character object
  if (!character) return null;

  return toRaw(character); // Remove Vue's reactive proxy
}

else
{
  const weapon = getWeaponField(id);
  if(!weapon) return null;

  return toRaw(weapon);
}
};

const handleInventoryUpdate = ({id, quantity}) => {
  inventoryStore.addMaterial(id, quantity); // 업데이트 메서드 호출
  updateFinalMaterialNeeds(); // Material Needs 재계산
  refreshFinalMaterialNeeds(); // 강제 재렌더링
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

  goals.value.forEach((goal) => {
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

  goals.value.forEach((goal) => {
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

  if (String(goal.id).startsWith("42"))
{
  dialogType.value = "character";
  selectedweapon.value = null;
  selectedCharacter.value = getCharacterField(goal.id); 

  currentSettings.value = selectedCharacter.value ? plannerStore.characterSettings[selectedCharacter.value.game_id] : null
}

else
{
  dialogType.value = "weapon";
  selectedCharacter.value = null;
  selectedweapon.value = getWeaponField(goal.id);

  currentSettings.value = selectedweapon.value ? plannerStore.weaponSettings[selectedweapon.value.game_id] : null
}

console.log(`[Debug] Selected Character: ${JSON.stringify(selectedCharacter.value)} or Selected Weapon: ${JSON.stringify(selectedweapon.value)}`);
console.log(`[Debug] Current Setting: ${currentSettings.value}`);


dialogVisible.value = true;
};

onMounted(()=>{
  console.log('goals', goals);
});
</script>

<style scooped>
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
}

.character-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 8px;
}

.edit-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #007bff;
}

.edit-button:hover {
  color: #0056b3;
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