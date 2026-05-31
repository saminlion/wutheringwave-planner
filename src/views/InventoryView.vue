<template>
  <div class="inventory-page">
    <h1>{{ tUI('inventory.title') }}</h1>

    <div class="inventory-container">
      <div v-for="(subCategories, category) in groupedMaterials" :key="category" class="category-section">
        <h2 class="category-title">{{ translateCategoryName(category) }}</h2>

        <div v-for="(materials, subcategory) in subCategories" :key="subcategory" class="subcategory-block">
          <div class="subcategory-label">{{ translateCategoryName(subcategory) }}</div>
          <div class="inventory-grid">
            <div
              class="inventory-card"
              v-for="material in materials"
              :key="material.game_id"
              :title="tMaterial(material.game_id, material.label)"
            >
              <img :src="material.icon" :alt="tMaterial(material.game_id, material.label)" class="material-icon" />
              <div class="material-qty">{{ quantities[material.game_id] || 0 }}</div>
              <input
                type="number"
                class="quantity-input"
                v-model.number="newQuantities[material.game_id]"
                placeholder="0"
                min="0"
                @keyup.enter="setQuantity(material.game_id)"
                @change="setQuantity(material.game_id)"
              />
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

const { tMaterial, tUI } = useLocale();

const translateCategoryName = (categoryName) => {
  const translated = tUI(`category.${categoryName}`);
  return translated !== `category.${categoryName}` ? translated : categoryName;
};

const inventoryStore = useInventoryStore();
const gameStore = useGameStore();

const inventory = computed(() => inventoryStore.inventory);

const materials = computed(() => {
  const data = gameStore.getData('materials');
  if (!data) return [];
  return Object.values(data).flatMap((category) => Object.values(category));
});

const quantities = ref({});
const newQuantities = ref({});

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

watch(
  inventory,
  (newInventory) => {
    materials.value.forEach((material) => {
      quantities.value[material.game_id] = newInventory[material.game_id] || 0;
    });
  },
  { deep: true }
);

onMounted(() => {
  const gameId = gameStore.currentGameId;
  inventoryStore.hydrate(gameId);
  materials.value.forEach((material) => {
    quantities.value[material.game_id] = inventory.value[material.game_id] || 0;
  });
});

const groupedMaterials = computed(() => {
  return materials.value.reduce((acc, material) => {
    if (!acc[material.Category]) acc[material.Category] = {};
    if (!acc[material.Category][material.SubCategory]) acc[material.Category][material.SubCategory] = [];
    acc[material.Category][material.SubCategory].push(material);
    return acc;
  }, {});
});

const setQuantity = (materialId) => {
  const inputVal = newQuantities.value[materialId];
  if (inputVal === null || inputVal === undefined || inputVal === '') return;

  const newQty = Math.max(0, parseInt(inputVal, 10) || 0);
  const currentQty = inventory.value[materialId] || 0;
  const difference = newQty - currentQty;

  if (difference > 0) {
    inventoryStore.addMaterial(materialId, difference);
  } else if (difference < 0) {
    inventoryStore.removeMaterial(materialId, Math.abs(difference));
  }

  newQuantities.value[materialId] = null;

  if (difference !== 0) {
    toast.success(`Updated: ${newQty}`, {
      position: 'bottom-center',
      autoClose: 1500,
      theme: 'dark',
    });
  }
};
</script>

<style scoped>
.inventory-page {
  padding: 0 16px 32px;
}

/* 카테고리 섹션을 행 우선(row-major) 그리드로 배치.
   원래 카테고리 순서를 좌→우로 유지해 가시성/전달성을 지키면서(우선순위 ①),
   여러 열로 채워 세로 스크롤도 단축(우선순위 ②). 화면 폭 따라 열 수 자동 조정. */
.inventory-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
  align-items: start; /* 같은 행에서 섹션이 최대 높이로 늘어나지 않게 */
}

.category-section {
  background: var(--bg-surface, #f9f9f9);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 10px;
  padding: 12px 16px;
}

.category-title {
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-secondary, #666);
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.subcategory-block {
  margin-bottom: 10px;
}

.subcategory-block:last-child {
  margin-bottom: 0;
}

.subcategory-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #999);
  margin-bottom: 6px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
}

.inventory-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 8px 6px;
  width: auto;
  cursor: default;
  transition: border-color 0.15s;
}

.inventory-card:hover {
  border-color: var(--accent-color, #4a90e2);
}

.material-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.material-qty {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #333);
  line-height: 1;
}

.quantity-input {
  width: 100%;
  box-sizing: border-box;
  padding: 3px 4px;
  text-align: center;
  font-size: 12px;
  border: 1px solid var(--border, #ccc);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text-primary, #333);
}

.quantity-input:focus {
  outline: none;
  border-color: var(--accent-color, #4a90e2);
}
</style>
