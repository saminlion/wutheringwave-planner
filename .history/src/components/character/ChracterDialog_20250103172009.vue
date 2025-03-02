<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-content">
            <h2>Selected Character: {{ character?.display_name || 'Unknown' }}</h2>
            <img :src="character?.icon || ''" :alt="character?.display_name || 'Unknown'" width="100" />
            <p>Weapon: {{ character?.weapon || 'Unknown' }}</p>

            <div class="tabs">
                <button v-for="tab in tabs" :key="tab" :class="{ active: currentTab === tab }"
                    @click="currentTab = tab">
                    {{ tab }}
                </button>
            </div>

            <div v-if="currentTab === 'Level'">
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
            </div>
            <div v-if="currentTab === 'Skills'">
                <h3>Active Skills</h3>
  <div class="skills-container">
    <div v-for="(skill, index) in activeSkills" :key="index" class="skill-card">
      <h4>{{ skill.label }}</h4>
      <div class="level-controls">
        <button @click="updateSkillLevel(skill, 'current', -1)">-</button>
        <span>{{ settings.activeSkills[`${skill.model_value}_current_level`] }}</span>
        <button @click="updateSkillLevel(skill, 'current', 1)">+</button>
        <span> >> </span>
        <button @click="updateSkillLevel(skill, 'target', -1)">-</button>
        <span>{{ settings.activeSkills[`${skill.model_value}_target_level`] }}</span>
        <button @click="updateSkillLevel(skill, 'target', 1)">+</button>
      </div>
    </div>
  </div>

  <h3>Passive Skills</h3>
  <div class="skills-container">
    <div v-for="(tier, tierIndex) in passiveSkills" :key="tierIndex" class="skill-tier">
      <h4>{{ tier.label }}</h4>
      <div v-for="(skill, skillIndex) in tier.data" :key="skillIndex" class="skill-card">
        <h4>{{ skill.label }}</h4>
        <div class="checkbox-control">
          <label>Activate</label>
          <input type="checkbox" v-model="settings.passiveSkills[skill.model_value]" @change="updateCharacter" />
        </div>
      </div>
    </div>
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
    passiveSkills: Object,
});

const tabs = ['Level', 'Skills'];
const currentTab = ref('Level');

const emit = defineEmits(['close', 'updateCharacter']);

const closeDialog = () => {
    emit('close');
};

const updateCharacter = () => {
    emit('updateCharacter');
};

const updateSkillLevel = (skill, type, delta) => {
  const key = `${skill.model_value}_${type}_level`;
  const newValue = settings.activeSkills[key] + delta;
  if (newValue >= 1 && newValue <= 10) {
    settings.activeSkills[key] = newValue;
    updateCharacter();
  }
};

onMounted(() => {
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

.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.tabs button {
    padding: 10px 20px;
    border: none;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.3s;
}

.tabs button.active {
    background: #4a90e2;
    color: white;
}

.tabs button:hover {
    background: #d0d0d0;
}

.skills-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.skill-card {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.skill-card h4 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.level-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.level-controls button {
  width: 30px;
  height: 30px;
  font-size: 18px;
  border: none;
  background: #e0e0e0;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.level-controls button:hover {
  background: #4a90e2;
  color: white;
}

.checkbox-control {
  margin-top: 10px;
}

.checkbox-control label {
  margin-right: 10px;
}
</style>