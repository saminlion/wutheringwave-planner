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
import { computed } from 'vue';
import { usePlannerStore } from '../store/planner';
import { useInventoryStore } from '../store/inventory'; // Inventory Store 가져오기
import { findMaterial, getMaterialField, calculatePlayerExp, calculateTotalMaterialNeeds } from '../services/materialHelper';

// Store data
const plannerStore = usePlannerStore();
const inventoryStore = useInventoryStore(); // Inventory Store 참조

const inventory = computed(() => inventoryStore.inventory);
const goals = computed(() => plannerStore.goals);

const expMaterialTypeStructure = {
  43010001: { exp_value: 100 }, // basic_resonance_potion
  43010002: { exp_value: 200 }, // medium_resonance_potion
  43010003: { exp_value: 500 }, // advanced_resonance_potion
  43010004: { exp_value: 1000 }, // premium_resonance_potion
};

// Helper function: Get material icon
const getMaterialIcon = (materialId) => {
  const types = ['common', 'ascension', 'boss', 'weeklyBoss', 'player_exp', 'weapon_exp', 'forgery', 'credit'];
  for (const type of types) {
    const material = findMaterial(type, materialId, null, true);
    console.log(`[Debug] Searching MaterialId: ${materialId}, Type: ${type}, Found:`, material);
    if (material) {

      console.log('Get Material:', material);

      return getMaterialField(material, 'icon');
    }
  }
  console.warn(`Icon not found for materialId: ${materialId}`);
  return null;
};

// Helper function: Filter out processed data and log to console
const filterProcessed = (materials) => {
  if (materials.processed) {
    console.log(`[Debug] Processed Materials for goal:`, Array.from(materials.processed));
  }
  const { processed, ...filteredMaterials } = materials; // Exclude "processed" key
  return filteredMaterials;
};

// Compute final material needs
const finalMaterialNeeds = computed(() => {
  const totalNeeds = {};
  const ownedMaterials = inventory.value; // 사용자가 보유한 아이템

  // Merge all goal materials
  goals.value.forEach((goal) => {
    const filteredMaterials = filterProcessed(goal.materials); // Exclude "processed"

    Object.entries(filteredMaterials).forEach(([material, qty]) => {
      if (material === 'player_exp') {
        // Special handling for player_exp
        console.log(`[Debug] Calculating player_exp for ${qty} EXP`);

        const expResults = calculatePlayerExp(qty, expMaterialTypeStructure, ownedMaterials);
        Object.entries(expResults).forEach(([materialId, { needed }]) => {
          totalNeeds[materialId] = (totalNeeds[materialId] || 0) + needed;
        });
      } else if (material.startsWith('common') || material.startsWith('forgery')) {
        // Skip for synthesis calculation
        totalNeeds[material] = (totalNeeds[material] || 0) + qty;
      } else {
        // General materials
        totalNeeds[material] = (totalNeeds[material] || 0) + qty;
      }
    });
  });

  // Apply synthesis logic for 'common' and 'forgery'
  const synthesizableTypes = ['common', 'forgery'];
  const synthesizedNeeds = calculateTotalMaterialNeeds(totalNeeds, synthesizableTypes);

  // Subtract inventory from synthesizedNeeds
  const finalNeeds = { ...synthesizedNeeds };
  Object.entries(ownedMaterials).forEach(([material, qty]) => {
    if (finalNeeds[material]) {
      finalNeeds[material] -= qty;
      if (finalNeeds[material] < 0) {
        finalNeeds[material] = 0; // Ensure no negative values
      }
    }
  });

  // General materials not related to synthesis
  Object.entries(totalNeeds).forEach(([material, qty]) => {
    if (!material.startsWith('common') && !material.startsWith('forgery')) {
      finalNeeds[material] = (finalNeeds[material] || 0) + qty - (ownedMaterials[material] || 0);
      if (finalNeeds[material] < 0) finalNeeds[material] = 0; // Ensure no negative values
    }
  });

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
