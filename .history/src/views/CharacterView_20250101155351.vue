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

      <h3>Level</h3>
      <div>
        <label>
          Current Level:
          <select v-model="characterSettings[selectedCharacter.game_id].currentLevel" @change="updateCharacter">
            <option v-for="item in levelItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
        <label>
          Target Level:
          <select v-model="characterSettings[selectedCharacter.game_id].targetLevel" @change="updateCharacter">
            <option v-for="item in levelItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
      </div>

      <h3>Active Skills</h3>
      <div v-for="(skill, index) in activeSkills" :key="index">
        <label>{{ skill.label }} Current Level:</label>
        <input type="number"
          v-model="characterSettings[selectedCharacter.game_id][`${skill.model_value}_current_level`]"
          @change="updateCharacter" />
        <label>Target Level:</label>
        <input type="number" v-model="characterSettings[selectedCharacter.game_id][`${skill.model_value}_target_level`]"
          @change="updateCharacter" />
      </div>

      <h3>Passive Skills</h3>
      <div v-for="(tier, tierIndex) in passiveSkills" :key="tierIndex">
        <h4>{{ tier.label }}</h4>
        <div v-for="(skill, skillIndex) in tier.data" :key="skillIndex">
          <label>{{ skill.label }}</label>
          <input type="checkbox" v-model="characterSettings[selectedCharacter.game_id][skill.model_value]"
            @change="updateCharacter" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePlannerStore } from '../store/planner';
import { computed, reactive } from 'vue';
import { levelItems, activeSkills, passiveSkills } from '../data/formCharactersNew';
import characterData from '../data/character.json';

export default {
  name: 'CharacterView',
  setup() {
    const plannerStore = usePlannerStore();

    const selectedCharacter = computed(() => plannerStore.selectedCharacter);
    const currentSettings = computed(() =>
      selectedCharacter.value ? plannerStore.characterSettings[selectedCharacter.value.game_id] : {}
    );

    const updateCharacter = () => {
      if (!selectedCharacter.value) return;

      const characterId = selectedCharacter.value.game_id;

      // 현재 캐릭터 설정 업데이트
      plannerStore.updateCharacterSettings(characterId, currentSettings.value);

      // 기존 목표에서 캐릭터를 찾음
      const existingGoal = plannerStore.goals.find(
        (goal) => goal.name === selectedCharacter.value.display_name
      );

      const updatedMaterials = plannerStore.calculateMaterials(characterId);

      if (existingGoal) {
        // 기존 목표 업데이트
        existingGoal.materials = updatedMaterials;
      } else {
        // 새 목표 추가
        plannerStore.addGoal({
          name: selectedCharacter.value.display_name,
          type: 'character',
          materials: updatedMaterials,
        });
      }
    };

    const selectCharacter = (character) => {
      plannerStore.selectCharacter(character);
    };

    return {
      characters: characterData,
      levelItems,
      activeSkills,
      passiveSkills,
      selectedCharacter,
      currentSettings,
      updateCharacter,
      selectCharacter,
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