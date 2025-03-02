<template>
    <div class="final-material-needs">
      <h2>Final Material Needs</h2>
      <ul class="materials-grid">
        <li
          class="material-card"
          v-for="(qty, mat) in materials"
          :key="mat"
        >
          <img
            v-if="getMaterialIcon(mat)"
            :src="getMaterialIcon(mat)"
            alt="material icon"
            class="material-icon"
          />
          <div class="material-info">
            <span class="material-quantity">{{ qty > 0 ? qty : 0 }}</span>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  import {
    findMaterial,
    getMaterialField
  } from "@/services/materialHelper";
  
  const props = defineProps({
    materials: Object // 전달받은 재료 목록
  });
  
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
  </script>
  
  <style scoped>
  .materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 8px;
    margin-top: 12px;
    list-style: none;
    padding: 0;
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
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
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
  