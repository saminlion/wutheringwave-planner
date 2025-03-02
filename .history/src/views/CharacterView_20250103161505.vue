<template>
  <div>
    <h1>Character Selection</h1>
    <div class="filters">
      <label>
        Element:
        <select v-model="filters.element" @change="applyFilters">
          <option value="all">All</option>
          <option value="glacio">Glacio</option>
          <option value="fusion">Fusion</option>
          <option value="aero">Aero</option>
          <option value="electro">Electro</option>
          <option value="havoc">Havoc</option>
        </select>
      </label>
      <label>
        Weapon:
        <select v-model="filters.weapon" @change="applyFilters">
          <option value="all">All</option>
          <option value="sword">Sword</option>
          <option value="pistols">Pistols</option>
          <option value="rectifier">Rectifier</option>
          <option value="gauntlets">Gauntlets</option>
          <option value="broadblade">Broadblade</option>
        </select>
      </label>
      <label>
        Rarity:
        <select v-model="filters.rarity" @change="applyFilters">
          <option value="all">All</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
    </div>

    <div class="character-grid">
      <div
        v-for="character in filteredCharacters"
        :key="character.game_id"
        @click="selectCharacter(character)"
        :class="['character-card', { 'rarity-4': character.rarity === 4, 'rarity-5': character.rarity === 5 }]"
      >
        <img :src="character.icon" :alt="character.display_name" />
        <div class="character-info">
          <span>{{ character.display_name }}</span>
        </div>
      </div>
    </div>


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

const characters = ref(Object.values(charactersData).filter(entry => !entry._comment));


const filters = ref({
  element: 'all',
  weapon: 'all',
  rarity: 'all',
});

const filteredCharacters = computed(() => {
  return characters.value.filter(character => {
    return (
      (filters.value.element === 'all' || character.element === filters.value.element) &&
      (filters.value.weapon === 'all' || character.weapon === filters.value.weapon) &&
      (filters.value.rarity === 'all' || character.rarity === parseInt(filters.value.rarity))
    );
  });
});

const applyFilters = () => {
  console.log('Filters applied:', filters.value);
};

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

<style scoped>
.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.character-card {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  width: 100px; /* 너비 설정 */
  aspect-ratio: 1 / 1; /* 정사각형 비율 유지 */
}

.character-card:hover {
  transform: scale(1.05);
}

.rarity-4 {
  background-color: #4a90e2;
  color: white;
}

.rarity-5 {
  background-color: #ffd700;
  color: black;
}

.character-card img {
  max-width: 100%;
  height: auto;
  border-radius: 50%;
  margin-bottom: 10px;
}

.character-info span {
  display: block;
  font-weight: bold;
}
</style>