<template>
  <div>
    <h1>Planner</h1>
    <div>
      <h2>Goals</h2>
      <div class="goals-container">
        <div class="goal-border" v-for="goal in goals" :key="goal.name" :style="setGradientStyle(getRawData(goal.id), true)">
          <div class="goal-card">
            <!-- 캐릭터 이름과 아이콘 -->
            <div class="goal-header">
              <img :src="getCharacterField(goal.id, 'icon')" alt="Character Icon" class="character-icon" />
              <h3>{{ getCharacterField(goal.id, 'display_name') }}</h3>
              <button class="edit-button" @click="openDialog(goal)">
                ✎
              </button>
            </div>

            <!-- 재료 리스트 -->
            <div class="goal-materials">
  <div class="materials-grid">
    <div
      class="material-card"
      v-for="(qty, mat) in filterProcessed(goal.materials)"
      :key="mat"
    >
      <img
        v-if="getMaterialIcon(mat)"
        :src="getMaterialIcon(mat)"
        alt="material icon"
        class="material-icon"
      />
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

      <FinalMaterialNeeds :materials="finalMaterialNeeds" />
  </div>
</template>

<script setup>
import { reactive, computed, toRaw } from "vue";
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

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();

const inventory = computed(() => inventoryStore.inventory);
const goals = computed(() => plannerStore.goals);

const expMaterialTypeStructure = {
  43010001: { exp_value: 100 },
  43010002: { exp_value: 200 },
  43010003: { exp_value: 500 },
  43010004: { exp_value: 1000 },
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
  const character = getCharacterField(id); // Retrieve character object
  if (!character) return null;

  return toRaw(character); // Remove Vue's reactive proxy
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

  const { final_needs, synthesis_results } = calculateMaterials(
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

  return { ...final_needs, ...playerExpResults };
});

const openDialog = (goal) => {
  // 다이얼로그를 열 때 해당 캐릭터 정보를 전달
  console.log("Open dialog for goal:", goal);
};
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