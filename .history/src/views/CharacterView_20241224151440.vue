<template>
  <div>
    <h1>Character Selection</h1>
    <ul>
      <li v-for="(character, key) in characters" :key="key" @click="selectCharacter(character)">
        <img :src="character.icon" :alt="character.display_name" width="50" />
        <span>{{ character.display_name }}</span>
      </li>
    </ul>
    <div v-if="selectedCharacter">
      <h2>Selected Character: {{ selectedCharacter.display_name }}</h2>
      <img :src="selectedCharacter.icon" :alt="selectedCharacter.display_name" width="100" />
      <p>Weapon: {{ selectedCharacter.weapon }}</p>

      <!-- 레벨 설정 -->
      <h3>Level</h3>
      <div>
        <label>
          Current Level:
          <input type="number" v-model="characterSettings.char_current_level" @change="updateCharacter" />
        </label>
        <label>
          Target Level:
          <input type="number" v-model="characterSettings.char_target_level" @change="updateCharacter" />
        </label>
      </div>

      <!-- 액티브 스킬 설정 -->
      <h3>Active Skills</h3>
      <div v-for="(skill, index) in activeSkills" :key="index">
        <label>{{ skill.label }} Current Level:</label>
        <input type="number" v-model="characterSettings[skill.model_value + '_current_level']" @change="updateCharacter" />
        <label>Target Level:</label>
        <input type="number" v-model="characterSettings[skill.model_value + '_target_level']" @change="updateCharacter" />
      </div>

      <!-- 패시브 스킬 설정 -->
      <h3>Passive Skills</h3>
      <div v-for="(skill, index) in passiveSkills" :key="index">
        <label>{{ skill.label }}</label>
        <input type="checkbox" v-model="characterSettings[skill.model_value]" @change="updateCharacter" />
      </div>

      <!-- 필요 재료 -->
      <h3>Materials Needed</h3>
      <div v-for="(material, key) in materials" :key="key">
        <span>{{ material.label }}: {{ material.quantity }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { usePlannerStore } from '../store/plannerStore';
import { computed, reactive } from 'vue';
import characterData from '../data/character.json';
import { activeSkills, passiveSkills } from '../data/formCharactersNew';

export default {
  name: 'CharacterView',
  setup() {
    const plannerStore = usePlannerStore();

    const selectedCharacter = computed(() => plannerStore.selectedCharacter);
    const characterSettings = reactive({
      char_current_level: 1,
      char_target_level: 1,
      ...plannerStore.characterSettings,
    });

    const materials = computed(() => plannerStore.calculateMaterials(characterSettings));

    const characters = characterData;

    const selectCharacter = (character) => {
      plannerStore.selectCharacter(character);
      plannerStore.initializeCharacterSettings(character.game_id);
    };

    const updateCharacter = () => {
      plannerStore.updateCharacterSettings(selectedCharacter.value.game_id, characterSettings);
    };

    return {
      characters,
      selectedCharacter,
      characterSettings,
      activeSkills,
      passiveSkills,
      materials,
      selectCharacter,
      updateCharacter,
    };
  },
};
</script>

<style>
li {
  cursor: pointer;
  margin: 10px 0;
  display: flex;
  align-items: center;
}

li img {
  margin-right: 10px;
  border-radius: 5px;
}

h3 {
  margin-top: 20px;
}
</style>