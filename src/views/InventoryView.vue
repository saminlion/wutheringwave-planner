<template>
  <div>
    <h1>{{ tUI('inventory.title') }}</h1>

    <!-- Inventory Cards -->
     <div class="inventory-container">
      <div v-for="(subCategories, category) in groupedMaterials" :key="category" class="category-section">
        <h2 class="category-title">{{ translateCategoryName(category) }}</h2>
      <div v-for="(materials, subcategory) in subCategories" :key="subcategory" class="subcategory-section">
        <h3 class="subcategory-title">{{ translateCategoryName(subcategory) }}</h3>

    <div class="inventory-grid">
      <div class="inventory-card" v-for="material in materials" :key="material.game_id">
        <img :src="material.icon" :alt="tMaterial(material.game_id, material.label)" class="material-icon" />
        <div class="material-info">
          <h3>{{ tMaterial(material.game_id, material.label) }}</h3>
          <h3>{{ logMessage(material) }}</h3>
          <p>
            {{ tUI('inventory.quantity') }}:
            <input type="number" v-model.number="quantities[material.game_id]" @change="update(material.game_id)"
              class="quantity-input" />
          </p>
        </div>
      </div>
    </div>
  </div>
  </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { toast } from 'vue3-toastify';
import { useInventoryStore } from '../store/inventory.js';
import { useGameStore } from '@/store/game';
import { useLocale } from '@/composables/useLocale';
import logger from '@/utils/logger';

// i18n翻訳関数を取得
const { tMaterial, tUI } = useLocale();

// カテゴリ名の翻訳ヘルパー関数
const translateCategoryName = (categoryName) => {
    const translated = tUI(`category.${categoryName}`);
    return translated !== `category.${categoryName}` ? translated : categoryName;
};

const inventoryStore = useInventoryStore();
const gameStore = useGameStore();

const inventory = computed(() => inventoryStore.inventory);

// 현재 게임의 재료 데이터 (반응형)
const materials = computed(() => {
  const data = gameStore.getData('materials');
  if (!data) return [];
  return Object.values(data).flatMap((category) => Object.values(category));
});

// Local state to manage input values
const quantities = ref({});

// Watch materials changes and sync quantities
watch(
  materials,
  (newMaterials) => {
    newMaterials.forEach((material) => {
      if (quantities.value[material.game_id] === undefined) {
        quantities.value[material.game_id] = inventory.value[material.game_id] || 0;
      }
    });
  },
  { immediate: true }
);

// Watch inventory changes and sync to quantities
watch(
  inventory,
  (newInventory) => {
    materials.value.forEach((material) => {
      quantities.value[material.game_id] = newInventory[material.game_id] || 0;
    });
  },
  { deep: true }
);

// Initialize quantities on mount
onMounted(() => {
  // Ensure inventory is loaded from localStorage first
  const gameId = gameStore.currentGameId;
  inventoryStore.hydrate(gameId);

  // Then sync quantities with loaded inventory
  materials.value.forEach((material) => {
    quantities.value[material.game_id] = inventory.value[material.game_id] || 0;
  });

  logger.debug('Inventory loaded and quantities synced:', inventory.value);
});

const logMessage = (material) => {
  logger.debug('Check Material Set:', material);
};

const groupedMaterials = computed(()=>{
  return materials.value.reduce((acc, material)=>{
    if (!acc[material.Category]){
      acc[material.Category] = {};
    }

    if (!acc[material.Category][material.SubCategory])
    {
      acc[material.Category][material.SubCategory] = [];
    }

    acc[material.Category][material.SubCategory].push(material);

    return acc;
  }, {});
});

// Update material quantity directly (without debounce for immediate save)
const update = (materialId) => {
  const newQuantity = quantities.value[materialId];
  const currentQuantity = inventory.value[materialId] || 0;
  const difference = newQuantity - currentQuantity;

  if (difference > 0) {
    // Add directly without debounce
    inventoryStore.addMaterial(materialId, difference);
    toast.success(`Item updated: ${materialId}, Quantity: ${newQuantity}`, {
      position: 'bottom-center',
      autoClose: 2000,
      theme: 'dark',
    });
  } else if (difference < 0) {
    // Remove directly without debounce
    inventoryStore.removeMaterial(materialId, Math.abs(difference));
    toast.success(`Item updated: ${materialId}, Quantity: ${newQuantity}`, {
      position: 'bottom-center',
      autoClose: 2000,
      theme: 'dark',
    });
  }
};
</script>

<style>
/* Main container style */
.inventory-container {
  padding: 16px;
}

/* Category title */
.category-title {
  font-size: 24px;
  margin-top: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #333;
}

/* Subcategory title */
.subcategory-title {
  font-size: 20px;
  margin-top: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #666;
}

/* Grid layout for inventory cards */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

/* Individual inventory card */
.inventory-card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Material icon */
.material-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 8px;
}

/* Material info */
.material-info {
  font-size: 14px;
}

/* Quantity input */
.quantity-input {
  width: 80px;
  margin-left: 4px;
  text-align: center;
}

.vue3-toastify__toast-container {
  font-size: 14px;
  border-radius: 8px;
}
</style>
