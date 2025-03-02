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
          {{ mat }}: {{ qty > 0 ? qty : 0 }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { usePlannerStore } from '../store/plannerStore';
import { computed } from 'vue';

export default {
  name: 'PlannerView',
  setup() {
    const plannerStore = usePlannerStore();

    const inventory = computed(() => plannerStore.inventory);
    const goals = computed(() => plannerStore.goals);
    const materialNeeds = computed(() => plannerStore.getMaterialNeeds);

    return {
      inventory,
      goals,
      materialNeeds,
    };
  },
};
</script>

<style>
ul {
  list-style-type: none;
  padding: 0;
}
</style>
