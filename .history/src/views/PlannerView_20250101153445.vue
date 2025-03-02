<template>
  <div>
    <h1>Planner</h1>
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
    <div>
      <h2>Inventory</h2>
      <ul>
        <li v-for="(qty, mat) in inventory" :key="mat">
          {{ mat }}: {{ qty }}
        </li>
      </ul>
    </div>
    <div>
      <h2>Material Needs</h2>
      <ul>
        <li v-for="(qty, mat) in materialNeeds" :key="mat">
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
const materialNeeds = computed(() => plannerStore.getMaterialNeeds); // 중복 호출 방지

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
