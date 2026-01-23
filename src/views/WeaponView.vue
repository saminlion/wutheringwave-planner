<template>
    <div>
      <h1>Weapon Selection</h1>
      <div class="filters">
        <label>
          Type:
          <select v-model="filters.type" @change="applyFilters">
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
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>
      </div>
  
      <div class="weapon-grid">
        <div v-for="weapon in filteredweapons" :key="weapon.game_id" @click="openDialog(weapon)"
        class="weapon-card" :style="getGradientStyle(weapon)">
        <!-- <div v-for="weapon in filteredweapons" :key="weapon.game_id" @click="logweapon(weapon)"
        class="weapon-card" :style="getGradientStyle(weapon)"> -->
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
  import { ref, computed } from 'vue';
  import { usePlannerStore } from '../store/planner';
  import { weaponLevelItems } from '../data/formweapons';
  import { setGradientStyle } from '../services/utils';
  import WeaponDialog from '../components/weapon/WeaponDialog.vue';
  import { weaponData as weaponsData } from '@/games/wutheringwave';
  import { useLocale } from '@/composables/useLocale';
  import logger from '@/utils/logger';

  // i18n翻訳関数を取得
  const { tWeapon } = useLocale();

  const plannerStore = usePlannerStore();
  
  const weapons = ref(Object.values(weaponsData).filter(entry => !entry._comment));
  
  const filters = ref({
    type: 'all',
    rarity: 'all',
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

  // 臾닿린 ?낅뜲?댄듃
  const updateweapon = () => {
    if (!selectedweapon.value) return;

    const weaponId = selectedweapon.value.game_id;

    // ?ㅼ젙媛??낅뜲?댄듃
    plannerStore.updateWeaponSettings(weaponId, currentSettings.value);

    logger.debug('Updated Settings:', currentSettings.value);

    // ?щ즺 怨꾩궛 諛?紐⑺몴 ?낅뜲?댄듃
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
    /* ?덈퉬 ?ㅼ젙 */
    aspect-ratio: 1 / 1;
    /* ?뺤궗媛곹삎 鍮꾩쑉 ?좎? */
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
