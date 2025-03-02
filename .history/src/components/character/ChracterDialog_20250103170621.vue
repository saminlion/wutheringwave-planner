<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog-content">
        <h2>Selected Character: {{ character.display_name }}</h2>
        <img :src="character.icon" :alt="character.display_name" width="100" />
        <p>Weapon: {{ character.weapon }}</p>
  
        <h3>Level</h3>
        <div>
          <label>
            Current Level:
            <select v-model="settings.currentLevel" @change="updateCharacter">
              <option v-for="item in levelItems" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label>
            Target Level:
            <select v-model="settings.targetLevel" @change="updateCharacter">
              <option v-for="item in levelItems" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
        </div>
  
        <h3>Active Skills</h3>
        <div v-for="(skill, index) in activeSkills" :key="index">
          <label>{{ skill.label }} Current Level:</label>
          <input type="number" v-model="settings.activeSkills[`${skill.model_value}_current_level`]"
            @change="updateCharacter" />
          <label>Target Level:</label>
          <input type="number" v-model="settings.activeSkills[`${skill.model_value}_target_level`]"
            @change="updateCharacter" />
        </div>
  
        <h3>Passive Skills</h3>
        <div v-for="(tier, tierIndex) in passiveSkills" :key="tierIndex">
          <h4>{{ tier.label }}</h4>
          <div v-for="(skill, skillIndex) in tier.data" :key="skillIndex">
            <label>{{ skill.label }}</label>
            <input type="checkbox" v-model="settings.passiveSkills[skill.model_value]" @change="updateCharacter" />
          </div>
        </div>
  
        <button @click="closeDialog">Close</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  
  const props = defineProps({
    visible: Boolean,
    character: Object,
    settings: Object,
    levelItems: Array,
    activeSkills: Array,
    passiveSkills: Array,
  });
  
  const emit = defineEmits(['close', 'updateCharacter']);
  
  const closeDialog = () => {
    emit('close');
  };
  
  const updateCharacter = () => {
    emit('updateCharacter');
  };


  onMounted(() => {
  console.log('Char:', character);
});

  </script>
  
  <style scoped>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .dialog-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
  }
  </style>
  