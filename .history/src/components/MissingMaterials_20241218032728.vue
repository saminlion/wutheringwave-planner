<template>
    <div>
      <h2>Missing Materials</h2>
      <ul>
        <li v-for="item in missingMaterials" :key="item.name">
          <span>{{ item.name }}: Missing {{ item.missing }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  import { usePlannerStore } from "@/stores/plannerStore";
  
  const store = usePlannerStore();
  const missingMaterials = computed(() => store.calculateMissingMaterials());
  </script>
  
  <style scoped>
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 10px;
  }
  </style>
  