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
            <li v-for="(qty, mat) in goal.materials" :key="mat">
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
import { findMaterial, getMaterialField } from '../services/materialHelper';

// Store data
const plannerStore = usePlannerStore();
const inventory = computed(() => plannerStore.inventory);
const goals = computed(() => plannerStore.goals);

// Helper function: Get material icon
const getMaterialIcon = (materialName) => {
  const types = ['common', 'ascension', 'boss', 'weeklyBoss', 'player_exp', 'weapon_exp', 'forgery'];
  for (const type of types) {
    const material = findMaterial(type, materialName);
    if (material) {
      return getMaterialField(material, 'icon');
    }
  }
  return null;
};

// Compute final material needs
const finalMaterialNeeds = computed(() => {
  const totalNeeds = {};

  // Merge all goal materials
  goals.value.forEach((goal) => {
    Object.entries(goal.materials).forEach(([material, qty]) => {
      totalNeeds[material] = (totalNeeds[material] || 0) + qty;
    });
  });

  // Subtract inventory from total needs
  Object.entries(inventory.value).forEach(([material, qty]) => {
    if (totalNeeds[material]) {
      totalNeeds[material] -= qty;
      if (totalNeeds[material] < 0) {
        totalNeeds[material] = 0; // Ensure no negative values
      }
    }
  });

  return totalNeeds;
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
