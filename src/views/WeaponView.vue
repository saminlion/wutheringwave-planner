<template>
  <div>
    <h1>{{ tUI('weapon.title') }}</h1>
    <div class="filters">
      <label>
        {{ tUI('weapon.type') }}:
        <select v-model="filters.type" @change="applyFilters">
          <option v-for="opt in filterOptions.weaponTypes" :key="opt.value" :value="opt.value">
            {{ opt.value === 'all' ? tUI('common.all') : opt.label }}
          </option>
        </select>
      </label>
      <label>
        {{ tUI('weapon.rarity') }}:
        <select v-model="filters.rarity" @change="applyFilters">
          <option v-for="opt in filterOptions.weaponRarities" :key="opt.value" :value="opt.value">
            {{ opt.value === 'all' ? tUI('common.all') : opt.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="weapon-grid">
      <div v-for="weapon in filteredweapons" :key="weapon.game_id" @click="openDialog(weapon)"
      class="weapon-card" :style="getGradientStyle(weapon)">
        <img :src="weapon.icon" :alt="tWeapon(weapon.game_id, weapon.display_name)" />
        <div class="weapon-info">
          <span>{{ tWeapon(weapon.game_id, weapon.display_name) }}</span>
        </div>
      </div>
    </div>


    <WeaponDialog v-if="dialogVisible && selectedweapon" :visible="dialogVisible" :weapon="selectedweapon"
      :settings="currentSettings" :levelItems="weaponLevelItems"
      @close="dialogVisible = false" @updateweapon="updateweapon" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePlannerStore } from '../store/planner';
import { useGameStore } from '@/store/game';
import { setGradientStyle } from '../services/utils';
import WeaponDialog from '../components/weapon/WeaponDialog.vue';
import { useLocale } from '@/composables/useLocale';
import logger from '@/utils/logger';

// i18n翻訳関数を取得
const { tWeapon, tUI } = useLocale();

const plannerStore = usePlannerStore();
const gameStore = useGameStore();

// 현재 게임의 무기 데이터 (반응형)
const weapons = computed(() => {
  const data = gameStore.getData('weapons');
  if (!data) return [];
  return Object.values(data).filter(entry => !entry._comment);
});

// 현재 게임의 필터 옵션 (반응형)
const filterOptions = computed(() => gameStore.filters || {
  weaponTypes: [{ value: 'all', label: 'All' }],
  weaponRarities: [{ value: 'all', label: 'All' }],
});

// 현재 게임의 폼 필드 (반응형)
const weaponLevelItems = computed(() => gameStore.formFields?.weaponLevelItems || []);

const filters = ref({
  type: 'all',
  rarity: 'all',
});

// 게임 전환 시 필터 리셋
watch(() => gameStore.currentGameId, () => {
  filters.value = { type: 'all', rarity: 'all' };
});

const filteredweapons = computed(() => {
  return weapons.value.filter(weapon => {
    return (
      (filters.value.type === 'all' || weapon.type === filters.value.type) &&
      (filters.value.rarity === 'all' || weapon.rarity === parseInt(filters.value.rarity))
    );
  });
});

const applyFilters = () => {
  logger.debug('Filters applied:', filters.value);
};

const getGradientStyle = (weapon) => {
  return setGradientStyle(weapon)
};

const dialogVisible = ref(false);
const selectedweapon = ref(null);

const currentSettings = computed(() =>
  selectedweapon.value ? plannerStore.weaponSettings[selectedweapon.value.game_id] : null
);

const openDialog = (weapon) => {
  dialogVisible.value = true;

  selectedweapon.value = weapon;

  logger.debug('sele weapon:', selectedweapon.value);

  if (!plannerStore.weaponSettings[weapon.game_id]) {
    plannerStore.updateWeaponSettings(weapon.game_id, {
      currentLevel: '1',
      targetLevel: '1',
    });
  }
};

const logweapon = (weapon) => {
  logger.debug("Selected weapon:", weapon);
};

// 무기 업데이트
const updateweapon = () => {
  if (!selectedweapon.value) return;

  const weaponId = selectedweapon.value.game_id;

  // 설정값 업데이트
  plannerStore.updateWeaponSettings(weaponId, currentSettings.value);

  logger.debug('Updated Settings:', currentSettings.value);

  // 재료 계산 및 목표 업데이트
  const calculatedMaterials = plannerStore.calculateAllMaterials(weaponId, "weapon");

  plannerStore.addGoal({
    id: selectedweapon.value.game_id,
    type: 'weapon',
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

.weapon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.245rem;
}

.weapon-card {
  padding: 0.245rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  width: 150px;
  aspect-ratio: 1 / 1;
}

.weapon-card:hover {
  transform: scale(1.05);
}

.weapon-card img {
  max-width: 100%;
  height: auto;
  border-radius: 50%;
  margin-bottom: 10px;
}

.weapon-info span {
  display: block;
  font-weight: bold;
}
</style>
