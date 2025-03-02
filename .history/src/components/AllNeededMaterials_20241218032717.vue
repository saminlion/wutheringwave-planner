<template>
    <div>
      <h2>All Needed Materials</h2>
      <ul>
        <li v-for="item in neededMaterials" :key="item.name">
          <span>{{ item.name }}: {{ item.count }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  import { usePlannerStore } from "@/stores/plannerStore";
  
  const store = usePlannerStore();
  const neededMaterials = computed(() => store.calculateNeededMaterials());
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
  