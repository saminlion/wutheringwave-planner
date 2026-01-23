<template>
  <div class="endfield-data-view">
    <h1>Endfield Raw Data Input</h1>
    <p class="info-text">
      Endfield's progression system is still unknown. Use this page to input raw character/weapon data
      as it becomes available.
    </p>

    <div class="data-section">
      <h2>Character Data</h2>
      <textarea
        v-model="characterData"
        placeholder="Paste character JSON data here..."
        rows="10"
        class="data-input"
      ></textarea>
      <button @click="saveCharacterData" class="btn btn-primary">Save Character Data</button>
    </div>

    <div class="data-section">
      <h2>Weapon Data</h2>
      <textarea
        v-model="weaponData"
        placeholder="Paste weapon JSON data here..."
        rows="10"
        class="data-input"
      ></textarea>
      <button @click="saveWeaponData" class="btn btn-primary">Save Weapon Data</button>
    </div>

    <div class="data-section">
      <h2>Material Data</h2>
      <textarea
        v-model="materialData"
        placeholder="Paste material JSON data here..."
        rows="10"
        class="data-input"
      ></textarea>
      <button @click="saveMaterialData" class="btn btn-primary">Save Material Data</button>
    </div>

    <div class="data-section">
      <h2>Current Stored Data</h2>
      <div class="stored-data">
        <h3>Characters: {{ storedCharacterCount }}</h3>
        <h3>Weapons: {{ storedWeaponCount }}</h3>
        <h3>Materials: {{ storedMaterialCount }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import logger from '@/utils/logger';

const characterData = ref('');
const weaponData = ref('');
const materialData = ref('');

const storedCharacterCount = ref(0);
const storedWeaponCount = ref(0);
const storedMaterialCount = ref(0);

const STORAGE_KEYS = {
  characters: 'endfield_characters',
  weapons: 'endfield_weapons',
  materials: 'endfield_materials',
};

const saveCharacterData = () => {
  try {
    const parsed = JSON.parse(characterData.value);
    localStorage.setItem(STORAGE_KEYS.characters, JSON.stringify(parsed));

    const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    storedCharacterCount.value = count;

    toast.success(`Saved ${count} characters`);
    logger.info('Endfield character data saved');
  } catch (error) {
    toast.error('Invalid JSON format');
    logger.error('Failed to parse character data:', error);
  }
};

const saveWeaponData = () => {
  try {
    const parsed = JSON.parse(weaponData.value);
    localStorage.setItem(STORAGE_KEYS.weapons, JSON.stringify(parsed));

    const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    storedWeaponCount.value = count;

    toast.success(`Saved ${count} weapons`);
    logger.info('Endfield weapon data saved');
  } catch (error) {
    toast.error('Invalid JSON format');
    logger.error('Failed to parse weapon data:', error);
  }
};

const saveMaterialData = () => {
  try {
    const parsed = JSON.parse(materialData.value);
    localStorage.setItem(STORAGE_KEYS.materials, JSON.stringify(parsed));

    const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    storedMaterialCount.value = count;

    toast.success(`Saved ${count} materials`);
    logger.info('Endfield material data saved');
  } catch (error) {
    toast.error('Invalid JSON format');
    logger.error('Failed to parse material data:', error);
  }
};

const loadStoredData = () => {
  const characters = localStorage.getItem(STORAGE_KEYS.characters);
  const weapons = localStorage.getItem(STORAGE_KEYS.weapons);
  const materials = localStorage.getItem(STORAGE_KEYS.materials);

  if (characters) {
    const parsed = JSON.parse(characters);
    storedCharacterCount.value = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    characterData.value = JSON.stringify(parsed, null, 2);
  }

  if (weapons) {
    const parsed = JSON.parse(weapons);
    storedWeaponCount.value = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    weaponData.value = JSON.stringify(parsed, null, 2);
  }

  if (materials) {
    const parsed = JSON.parse(materials);
    storedMaterialCount.value = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    materialData.value = JSON.stringify(parsed, null, 2);
  }
};

onMounted(() => {
  loadStoredData();
});
</script>

<style scoped>
.endfield-data-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  margin-bottom: 8px;
}

.info-text {
  color: #666;
  margin-bottom: 24px;
}

.data-section {
  margin-bottom: 32px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.data-input {
  width: 100%;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 12px;
  resize: vertical;
}

.data-input:focus {
  outline: none;
  border-color: #2196f3;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.stored-data {
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.stored-data h3 {
  margin: 8px 0;
  color: #555;
  font-size: 16px;
}
</style>
