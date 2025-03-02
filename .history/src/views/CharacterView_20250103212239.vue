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
      <div v-for="character in filteredCharacters" :key="character.game_id" @click="openDialog(character)"
      class="character-card" :style="getGradientStyle(character)">
      <!-- <div v-for="character in filteredCharacters" :key="character.game_id" @click="logCharacter(character)" -->
      class="character-card" :style="getGradientStyle(character)">
        <img :src="character.icon" :alt="character.display_name" />
        <div class="character-info">
          <span>{{ character.display_name }}</span>
        </div>
      </div>
    </div>


    <CharacterDialog v-if="dialogVisible && selectedCharacter" :visible="dialogVisible" :character="selectedCharacter"
      :settings="currentSettings" :levelItems="levelItems" :activeSkills="activeSkills" :passiveSkills="passiveSkills"
      @close="dialogVisible = false" @updateCharacter="updateCharacter" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePlannerStore } from '../store/planner';
import { levelItems, activeSkills, passiveSkills } from '../data/formCharactersNew';
import { setGradientStyle } from '../services/utils';
import CharacterDialog from '../components/character/ChracterDialog.vue';
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

const getGradientStyle = (character) => {
  return setGradientStyle(character)
};

const dialogVisible = ref(false);
const selectedCharacter = ref(null);

const currentSettings = computed(() =>
  selectedCharacter.value ? plannerStore.characterSettings[selectedCharacter.value.game_id] : null
);

const openDialog = (character) => {
  dialogVisible.value = true;

  selectedCharacter.value = character;

  console.log('sele char:', selectedCharacter.value);

  if (!plannerStore.characterSettings[character.game_id]) {
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

const logCharacter = (character) => {
  console.log("Selected character:", character);
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
    id: selectedCharacter.value.game_id,
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
  gap: 1.245rem;
}

.character-card {
  padding: 0.245rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  width: 150px;
  /* 너비 설정 */
  aspect-ratio: 1 / 1;
  /* 정사각형 비율 유지 */
}

.character-card:hover {
  transform: scale(1.05);
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