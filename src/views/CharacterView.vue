<template>
  <div>
    <h1>Character Selection</h1>
    <div class="filters">
      <label v-if="filterOptions.elements?.length > 1">
        Element:
        <select v-model="filters.element" @change="applyFilters">
          <option v-for="opt in filterOptions.elements" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
      <label>
        Weapon:
        <select v-model="filters.weapon" @change="applyFilters">
          <option v-for="opt in filterOptions.weaponTypes" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
      <label>
        Rarity:
        <select v-model="filters.rarity" @change="applyFilters">
          <option v-for="opt in filterOptions.characterRarities" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="character-grid">
      <div v-for="character in filteredCharacters" :key="character.game_id" @click="openDialog(character)"
      class="character-card" :style="getGradientStyle(character)">
        <img :src="character.icon" :alt="tCharacter(character.game_id, character.display_name)" />
        <div class="character-info">
          <span>{{ tCharacter(character.game_id, character.display_name) }}</span>
        </div>
      </div>
    </div>


    <component
      :is="CharacterDialogComponent"
      v-if="dialogVisible && selectedCharacter && CharacterDialogComponent"
      :visible="dialogVisible"
      :character="selectedCharacter"
      :settings="currentSettings"
      :levelItems="characterLevelItems"
      :activeSkills="characterActiveSkills"
      :passiveSkills="characterPassiveSkills"
      @close="dialogVisible = false"
      @updateCharacter="updateCharacter"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePlannerStore } from '../store/planner';
import { useGameStore } from '@/store/game';
import { setGradientStyle } from '../services/utils';
import { useLocale } from '@/composables/useLocale';
import logger from '@/utils/logger';

// i18n翻訳関数を取得
const { tCharacter } = useLocale();

const plannerStore = usePlannerStore();
const gameStore = useGameStore();

// ゲーム専用ダイアログコンポーネント (動的ロード)
const CharacterDialogComponent = computed(() => gameStore.getComponent('CharacterDialog'));

// 현재 게임의 캐릭터 데이터 (반응형)
const characters = computed(() => {
  const data = gameStore.getData('characters');
  if (!data) return [];
  return Object.values(data).filter(entry => !entry._comment);
});

// 현재 게임의 필터 옵션 (반응형)
const filterOptions = computed(() => gameStore.filters || {
  elements: [{ value: 'all', label: 'All' }],
  weaponTypes: [{ value: 'all', label: 'All' }],
  characterRarities: [{ value: 'all', label: 'All' }],
});

// 현재 게임의 폼 필드 (반응형)
const characterLevelItems = computed(() => gameStore.formFields?.characterLevelItems || []);
const characterActiveSkills = computed(() => gameStore.formFields?.characterActiveSkills || []);
const characterPassiveSkills = computed(() => gameStore.formFields?.characterPassiveSkills || {});

const filters = ref({
  element: 'all',
  weapon: 'all',
  rarity: 'all',
});

// 게임 전환 시 필터 리셋
watch(() => gameStore.currentGameId, () => {
  filters.value = { element: 'all', weapon: 'all', rarity: 'all' };
});

const filteredCharacters = computed(() => {
  return characters.value.filter(character => {
    const elementMatch = filters.value.element === 'all' || character.element === filters.value.element;
    const weaponMatch = filters.value.weapon === 'all' || character.weapon === filters.value.weapon;
    const rarityMatch = filters.value.rarity === 'all' || character.rarity === parseInt(filters.value.rarity);
    return elementMatch && weaponMatch && rarityMatch;
  });
});

const applyFilters = () => {
  logger.debug('Filters applied:', filters.value);
};

const getGradientStyle = (character) => {
  return setGradientStyle(character)
};

const dialogVisible = ref(false);
const selectedCharacter = ref(null);

const currentSettings = computed(() =>
  selectedCharacter.value ? plannerStore.characterSettings[selectedCharacter.value.game_id] : null
);

// ゲーム別初期設定生成（configから取得）
const createInitialSettings = () => {
  const config = gameStore.currentGameConfig;
  if (config && typeof config.createCharacterInitialSettings === 'function') {
    return config.createCharacterInitialSettings();
  }
  // フォールバック: 基本構造
  return {
    currentLevel: '1',
    targetLevel: '1',
  };
};

const openDialog = (character) => {
  dialogVisible.value = true;

  selectedCharacter.value = character;

  logger.debug('sele char:', selectedCharacter.value);

  if (!plannerStore.characterSettings[character.game_id]) {
    plannerStore.updateCharacterSettings(character.game_id, createInitialSettings());
  }
};

const logCharacter = (character) => {
  logger.debug("Selected character:", character);
};

// 캐릭터 업데이트
const updateCharacter = () => {
  if (!selectedCharacter.value) return;

  const characterId = selectedCharacter.value.game_id;

  // 설정값 업데이트
  plannerStore.updateCharacterSettings(characterId, currentSettings.value);

  logger.debug('Updated Settings:', currentSettings.value);

  // 재료 계산 및 목표 업데이트
  const calculatedMaterials = plannerStore.calculateAllMaterials(characterId, "character");

  plannerStore.addGoal({
    id: selectedCharacter.value.game_id,
    type: 'character',
    materials: calculatedMaterials,
  });

  logger.debug('Updated Goals:', plannerStore.goals);

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
