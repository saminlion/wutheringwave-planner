<template>
  <div>
    <h1>Planner</h1>

    <!-- Goals -->
    <div>
      <h2>Goals</h2>
      <ul>
        <li v-for="goal in goals" :key="goal.name">
          {{ goal.name }} - Needed Materials:
          <ul>
            <li v-for="(qty, mat) in filterProcessed(goal.materials)" :key="mat">
              {{ mat }}: {{ qty }}
            </li>
          </ul>
        </li>
      </ul>
    </div>


    <!-- Inventory -->
    <div>
      <h2>Inventory</h2>
      <ul>
        <li v-for="(qty, mat) in inventory" :key="mat">
          {{ mat }}: {{ qty }}
        </li>
      </ul>
    </div>

    <!-- Final Material Needs -->
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
import { reactive, computed } from 'vue';
import { usePlannerStore } from '../store/planner';
import { useInventoryStore } from '../store/inventory'; // Inventory Store 가져오기
import { findMaterial, getMaterialField, calculatePlayerExp, calculateMaterials } from '@/services/materialHelper';
import { tieredMaterials } from '@/data/tieredMaterials';

const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore();

const inventory = computed(() => inventoryStore.inventory);
const goals = computed(() => plannerStore.goals);

const expMaterialTypeStructure = {
  43010001: { exp_value: 100 }, // basic_resonance_potion
  43010002: { exp_value: 200 }, // medium_resonance_potion
  43010003: { exp_value: 500 }, // advanced_resonance_potion
  43010004: { exp_value: 1000 }, // premium_resonance_potion
};

const materialResults = reactive({});

const filterProcessed = (materials) => {
  const { processed, ...filteredMaterials } = materials;
  return filteredMaterials;
};

const getMaterialIcon = (materialId) => {
  const types = ['common', 'ascension', 'boss', 'weeklyBoss', 'player_exp', 'weapon_exp', 'forgery', 'credit'];
  for (const type of types) {
    const material = findMaterial(type, materialId, null, true);
    if (material) {
      return getMaterialField(material, 'icon');
    }
  }
  return null;
};

const finalMaterialNeeds = computed(() => {
  const totalNeeds = {};
  const ownedMaterials = inventory.value;

  // Step 1: Calculate total needs based on goals
  goals.value.forEach((goal) => {
    const filteredMaterials = filterProcessed(goal.materials);
    Object.entries(filteredMaterials).forEach(([materialId, qty]) => {
      totalNeeds[materialId] = (totalNeeds[materialId] || 0) + qty;
    });
  });

  console.log("[Debug] Total Needs from Goals:", totalNeeds);

  // Step 2: Initialize results for synthesizable and non-synthesizable materials
  const synthesizableNeeds = {};
  const nonSynthesizableNeeds = {};
  let playerExpNeeds = 0;

  Object.entries(totalNeeds).forEach(([materialId, qty]) => {
    if (materialId === 'player_exp') {
      playerExpNeeds = qty;
    } else if (tieredMaterials.common[1]?.name === materialId || tieredMaterials.forgery[1]?.name === materialId) {
      synthesizableNeeds[materialId] = qty;
    } else {
      nonSynthesizableNeeds[materialId] = qty;
    }
  });

  console.log("[Debug] Synthesizable Needs:", synthesizableNeeds);
  console.log("[Debug] Non-Synthesizable Needs:", nonSynthesizableNeeds);

  // Step 3: Calculate synthesized needs using tieredMaterials
  const synthesizedNeeds = calculateMaterials(ownedMaterials, tieredMaterials, synthesizableNeeds).finalInventory;

  console.log("[Debug] Synthesized Needs:", synthesizedNeeds);

  // Step 4: Calculate player EXP needs
  const playerExpResults = calculatePlayerExp(playerExpNeeds, expMaterialTypeStructure, ownedMaterials);

  console.log("[Debug] Player EXP Results:", playerExpResults);

  // Step 5: Combine all needs into final results
  const finalNeeds = {};

  // Combine synthesized needs
  Object.entries(synthesizedNeeds).forEach(([materialId, qty]) => {
    if (totalNeeds[materialId]) { // Only include materials from Goals
      const ownedQty = ownedMaterials[materialId] || 0;
      finalNeeds[materialId] = Math.max(qty - ownedQty, 0);
    }
  });

  // Combine non-synthesizable needs
  Object.entries(nonSynthesizableNeeds).forEach(([materialId, qty]) => {
    if (totalNeeds[materialId]) { // Only include materials from Goals
      const ownedQty = ownedMaterials[materialId] || 0;
      finalNeeds[materialId] = Math.max(qty - ownedQty, 0);
    }
  });

  // Add player EXP needs
  Object.entries(playerExpResults).forEach(([materialId, { needed, owned }]) => {
    if (needed > 0) { // Only include if needed is greater than zero
      finalNeeds[materialId] = Math.max(needed - owned, 0);
    }
  });

  console.log("[Debug] Final Needs:", finalNeeds);

  return finalNeeds;
});
</script>

<style>
ul {
  list-style-type: none;
  padding: 0;
}
img {
  vertical-align: middle;
}
</style>
