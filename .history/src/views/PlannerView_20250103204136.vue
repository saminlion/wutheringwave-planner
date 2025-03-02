<template>
  <div>
    <h1>Planner</h1>
    <div>
      <h2>Goals</h2>
      <div class="goals-container">
        <div class="goal-card" v-for="goal in goals" :key="goal.name">
          <!-- 캐릭터 이름과 아이콘 -->
          <div class="goal-header">
            <img :src="goal.icon" alt="Character Icon" class="character-icon" />
            <h3>{{ goal.name }}</h3>
            <button class="edit-button" @click="openDialog(goal)">
              ✎
            </button>
          </div>

          <!-- 재료 리스트 -->
          <div class="goal-materials">
            <ul>
              <li v-for="(qty, mat) in filterProcessed(goal.materials)" :key="mat">
                <img
                  v-if="getMaterialIcon(mat)"
                  :src="getMaterialIcon(mat)"
                  alt="material icon"
                  class="material-icon"
                />
                {{ mat }}: {{ qty }}
              </li>
            </ul>
          </div>
        </div>
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

    <div>
      <h2>Final Material Needs</h2>
      <ul>
        <li v-for="(qty, mat) in finalMaterialNeeds" :key="mat">
          <img
            v-if="getMaterialIcon(mat)"
            :src="getMaterialIcon(mat)"
            alt="material icon"
            style="width: 24px; height: 24px; margin-right: 8px;"
          />
          {{ mat }}: {{ qty > 0 ? qty : 0 }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { usePlannerStore } from "@/store/planner";
import { useInventoryStore } from "@/store/inventory";
import {
  findMaterial,
  getMaterialField,
  calculatePlayerExp,
  calculateMaterials,
} from "@/services/materialHelper";
import { tieredMaterials } from "@/data/tieredMaterials";

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
