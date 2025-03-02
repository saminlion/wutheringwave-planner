<template>
    <div>
      <!-- 캐릭터 선택 -->
      <label>Select Character:</label>
      <select v-model="selectedCharacterName" @change="loadCharacter">
        <option disabled value="">-- Select --</option>
        <option v-for="character in characters" :key="character.name" :value="character.name">
          {{ character.name }}
        </option>
      </select>
  
      <!-- 캐릭터 정보 -->
      <div v-if="selectedCharacter">
        <h2>{{ selectedCharacter.name }} Settings</h2>
  
        <div>
          <h3>Level</h3>
          <label>Current Level:</label>
          <input type="number" v-model="selectedCharacter.currentLevel" min="1" @input="updateLevel" />
          <label>Target Level:</label>
          <input type="number" v-model="selectedCharacter.targetLevel" min="1" @input="updateLevel" />
        </div>
  
        <div>
          <h3>Skills</h3>
          <div v-for="(skill, index) in selectedCharacter.skills" :key="index">
            <span>{{ skill.name }}</span>
            <label>Current Level:</label>
            <input type="number" v-model="skill.currentLevel" min="1" max="10" @input="updateSkills" />
            <label>Target Level:</label>
            <input type="number" v-model="skill.targetLevel" min="1" max="10" @input="updateSkills" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useCharacterStore } from '@/stores/characterStore';
  
  const store = useCharacterStore();
  
  const selectedCharacterName = ref('');
  const selectedCharacter = computed(() => store.selectedCharacter);
  const characters = computed(() => store.characters);
  
  const loadCharacter = () => {
    store.setSelectedCharacter(selectedCharacterName.value);
  };
  
  const updateLevel = () => {
    store.updateCharacterLevel({
      currentLevel: selectedCharacter.value.currentLevel,
      targetLevel: selectedCharacter.value.targetLevel,
    });
  };
  
  const updateSkills = () => {
    store.updateCharacterSkills(selectedCharacter.value.skills);
  };
  </script>
  