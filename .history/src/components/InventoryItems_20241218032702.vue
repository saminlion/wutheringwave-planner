<template>
    <div>
      <h2>Inventory Items</h2>
      <ul>
        <li v-for="(item, key) in inventory" :key="key">
          <img :src="item.icon" width="50" />
          <span>{{ item.label }}: {{ item.count || 0 }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { useInventoryStore } from "@/stores/inventoryStore";
  import { computed } from "vue";
  
  const store = useInventoryStore();
  const inventory = computed(() => store.inventory);
  </script>
  
  <style scoped>
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  </style>
  