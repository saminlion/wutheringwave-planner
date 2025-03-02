<template>
  <div>
    <h1>Character Selection</h1>
    <ul>
      <li v-for="character in characters" :key="character.game_id" @click="selectCharacter(character)">
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
          <select v-model="currentSettings.currentLevel" @change="updateCharacter">
            <option v-for="item in levelItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
        <label>
          Target Level:
          <select v-model="currentSettings.targetLevel" @change="updateCharacter">
            <option v-for="item in levelItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
      </div>

      <h3>Active Skills</h3>
      <div v-for="(skill, index) in activeSkills" :key="index">
        <label>{{ skill.label }} Current Level:</label>
        <input type="number" v-model="currentSettings.activeSkills[`${skill.model_value}_current_level`]"
          @change="updateCharacter" />
        <label>Target Level:</label>
        <input type="number" v-model="currentSettings.activeSkills[`${skill.model_value}_target_level`]"
          @change="updateCharacter" />
      </div>

      <h3>Passive Skills</h3>
      <div v-for="(tier, tierIndex) in passiveSkills" :key="tierIndex">
        <h4>{{ tier.label }}</h4>
        <div v-for="(skill, skillIndex) in tier.data" :key="skillIndex">
          <label>{{ skill.label }}</label>
          <input type="checkbox" v-model="currentSettings.passiveSkills[skill.model_value]" @change="updateCharacter" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePlannerStore } from '../store/planner';
import { levelItems, activeSkills, passiveSkills } from '../data/formCharactersNew';
import charactersData from '../data/character.json'; // 캐릭터 데이터 로드

const plannerStore = usePlannerStore();

const characters = ref(charactersData); // character.json 데이터
const selectedCharacter = computed(() => plannerStore.selectedCharacter);
const currentSettings = computed(() =>
  selectedCharacter.value ? plannerStore.characterSettings[selectedCharacter.value.game_id] : null
);

// 캐릭터 선택
const selectCharacter = (character) => {
  plannerStore.selectCharacter(character);

  if (!plannerStore.characterSettings[character.game_id]) {
    // 초기 설정이 없으면 기본값 추가
    plannerStore.updateCharacterSettings(character.game_id, {
      currentLevel: '1',
      targetLevel: '1',
      activeSkills: activeSkills.reduce((acc, skill) => {
        acc[`${skill.model_value}_current_level`] = 1;
        acc[`${skill.model_value}_target_level`] = 1;
        return acc;
      }, {}),
      passiveSkills: passiveSkills.tier_1.data.concat(passiveSkills.tier_2.data).reduce((acc, skill) => {
        acc[skill.model_value] = false;
        return acc;
      }, {}),
    });
  }
};

// 캐릭터 업데이트
const updateCharacter = () => {
  if (!selectedCharacter.value) return;

  const characterId = selectedCharacter.value.game_id;

  // 설정값 업데이트
  plannerStore.updateCharacterSettings(characterId, currentSettings.value);

  console.log('Updated Settings:', currentSettings.value);

  // 재료 계산 및 목표 업데이트
  const calculatedMaterials = plannerStore.calculateMaterials(characterId);

  plannerStore.addGoal({
    name: selectedCharacter.value.display_name,
    type: 'character',
    materials: calculatedMaterials,
  });

  console.log('Updated Goals:', plannerStore.goals);

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