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
import { computed } from 'vue';
import { levelItems, activeSkills, passiveSkills } from '../data/formCharactersNew';
import characterData from '../data/character.json';

export default {
  name: 'CharacterView',
  setup() {
    const plannerStore = usePlannerStore();

    const selectedCharacter = computed(() => plannerStore.selectedCharacter);

    const characterSettings = computed(() => plannerStore.characterSettings);

    const updateCharacter = () => {
      const characterId = selectedCharacter.value.game_id;
      plannerStore.updateCharacterSettings(characterId, characterSettings.value[characterId]);

      const info = plannerStore.goals.find((name) => name == selectCharacter.value.display_name);

      if (info) {
        info = {
          ...info,
          materials: plannerStore.calculateMaterials(characterId), // 필요 재료 계산
        }
      }

      else {
        // 목표 추가 (addGoal 호출)
        plannerStore.addGoal({
          name: selectedCharacter.value.display_name,
          type: 'character',
          materials: plannerStore.calculateMaterials(characterId), // 필요 재료 계산
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
      characterSettings,
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