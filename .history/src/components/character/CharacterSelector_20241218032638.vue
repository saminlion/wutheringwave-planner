<template>
    <div class="character-selector">
      <h2>Select Character</h2>
      <select v-model="selectedCharacter" @change="loadCharacter">
        <option disabled value="">-- Select Character --</option>
        <option v-for="(char, key) in characters" :key="key" :value="key">
          {{ char.display_name }}
        </option>
      </select>
  
      <div v-if="character">
        <h3>{{ character.display_name }} Settings</h3>
        <img :src="character.icon" :alt="character.display_name" width="100" />
  
        <div>
          <label>Current Level:</label>
          <input type="number" v-model.number="currentLevel" min="1" />
          <label>Target Level:</label>
          <input type="number" v-model.number="targetLevel" min="1" />
          <button @click="updateLevel">Update Level</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useCharacterStore } from "@/stores/characterStore";
  
  const store = useCharacterStore();
  const characters = computed(() => store.characters);
  const selectedCharacter = ref("");
  const character = computed(() => store.selectedCharacter);
  
  const currentLevel = ref(1);
  const targetLevel = ref(1);
  
  const loadCharacter = () => {
    store.setSelectedCharacter(selectedCharacter.value);
    if (character.value) {
      currentLevel.value = character.value.char_current_level;
      targetLevel.value = character.value.char_target_level;
    }
  };
  
  const updateLevel = () => {
    store.updateCharacterLevel(
      selectedCharacter.value,
      currentLevel.value,
      targetLevel.value
    );
  };
  </script>
  
  <style scoped>
  .character-selector {
    margin: 20px;
  }
  </style>
  