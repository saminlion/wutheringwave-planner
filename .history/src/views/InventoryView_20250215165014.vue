<template>
    <div>
      <h1>Inventory</h1>
  
      <!-- Inventory Cards -->
      <div class="inventory-grid">
        <div class="inventory-card" v-for="material in materials" :key="material.game_id">
          <img :src="material.icon" :alt="material.label" class="material-icon" />
          <div class="material-info">
            <h3>{{ material.label }}</h3>
            <h3>{{ logMessage(material) }}</h3>
            <p>
              Quantity: 
              <input 
                type="number" 
                v-model.number="quantities[material.game_id]" 
                @change="update(material.game_id)" 
                class="quantity-input" 
              />
            </p>
            <div class="button-group">
              <button @click="remove(material.game_id, 1)">-</button>
              <button @click="add(material.game_id, 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useDebounceFn } from '@vueuse/core'
  import { toast } from 'vue3-toastify';
  import { useInventoryStore } from '../store/inventory.js';
  import inventoryItem from '../data/inventoryItem.json';
  
  const inventoryStore = useInventoryStore();
  
  const inventory = computed(() => inventoryStore.inventory);
  const materials = Object.values(inventoryItem).flatMap((category) => Object.values(category));
  
  // Local state to manage input values
  const quantities = ref(
    materials.reduce((acc, material) => {
      acc[material.game_id] = inventory.value[material.game_id] || 0;
      return acc;
    }, {})
  );
  
  const logMessage = (material) => {
    console.log(`Check Material Set: ${JSON.stringify(material)}`);
  };
    // 디바운스된 업데이트 함수 생성
    const debouncedUpdateMaterial = useDebounceFn((id, quantity) => {

      inventoryStore.addMaterial(id, quantity);
      quantities.value[id] = inventory.value[id]; // Sync local state

      toast.success(`Item updated successfully: ${id}, Quantitiy: ${quantity}`,{
        position: 'bottom-center',
        autoClose: 2000,
        theme: 'dark',
      });
    
    }, 1000);

  // Add material
  const add = (materialId, quantity) => {
    if (!materialId || quantity <= 0) {
      console.warn(`[Inventory] Invalid input for adding material: ${materialId}, ${quantity}`);
      return;
    }

    debouncedUpdateMaterial (materialId, quantity);
  };
  
  // Remove material
  const remove = (materialId, quantity) => {
    if (!materialId || quantity <= 0) {
      console.warn(`[Inventory] Invalid input for removing material: ${materialId}, ${quantity}`);
      return;
    }

    debouncedUpdateMaterial (materialId, quantity);
  };
  
  
  // Update material quantity directly
  const update = (materialId) => {
    const newQuantity = quantities.value[materialId];
    const currentQuantity = inventory.value[materialId] || 0;
    const difference = newQuantity - currentQuantity;
  
    if (difference > 0) {
      add(materialId, difference);
    } else if (difference < 0) {
      remove(materialId, Math.abs(difference));
    }
  };
  </script>
  
  <style>
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
  
  /* Button group */
  .button-group {
    margin-top: 8px;
  }
  
  .button-group button {
    margin: 0 4px;
    padding: 4px 8px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: #fff;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .button-group button:hover {
    background-color: #eaeaea;
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
  