<template>
    <div>
      <h1>Weapon Selection</h1>
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
          Type:
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
  
      <div class="weapon-grid">
        <div v-for="weapon in filteredweapons" :key="weapon.game_id" @click="openDialog(weapon)"
        class="weapon-card" :style="getGradientStyle(weapon)">
        <!-- <div v-for="weapon in filteredweapons" :key="weapon.game_id" @click="logweapon(weapon)"
        class="weapon-card" :style="getGradientStyle(weapon)"> -->
          <img :src="weapon.icon" :alt="weapon.display_name" />
          <div class="weapon-info">
            <span>{{ weapon.display_name }}</span>
          </div>
        </div>
      </div>
  
  
      <WeaponDialog v-if="dialogVisible && selectedweapon" :visible="dialogVisible" :weapon="selectedweapon"
        :settings="currentSettings" :levelItems="levelItems" :activeSkills="activeSkills" :passiveSkills="passiveSkills"
        @close="dialogVisible = false" @updateweapon="updateweapon" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { usePlannerStore } from '../store/planner';
  import { levelItems, activeSkills, passiveSkills } from '../data/formweaponsNew';
  import { setGradientStyle } from '../services/utils';
  import WeaponDialog from '../components/weapon/WeaponDialog.vue';
  import weaponsData from '../data/weapon.json'; // 캐릭터 데이터 로드
  
  const plannerStore = usePlannerStore();
  
  const weapons = ref(Object.values(weaponsData).filter(entry => !entry._comment));
  
  const filters = ref({
    element: 'all',
    type: 'all',
    rarity: 'all',
  });
  
  const filteredweapons = computed(() => {
    return weapons.value.filter(weapon => {
      return (
        (filters.value.element === 'all' || weapon.element === filters.value.element) &&
        (filters.value.weapon === 'all' || weapon.weapon === filters.value.weapon) &&
        (filters.value.rarity === 'all' || weapon.rarity === parseInt(filters.value.rarity))
      );
  
    });
  });
  
  const applyFilters = () => {
    console.log('Filters applied:', filters.value);
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
  
    console.log('sele weapon:', selectedweapon.value);
  
    if (!plannerStore.weaponSettings[weapon.game_id]) {
      plannerStore.updateweaponSettings(weapon.game_id, {
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
  
  const logweapon = (weapon) => {
    console.log("Selected weapon:", weapon);
  };
  
  // 캐릭터 업데이트
  const updateweapon = () => {
    if (!selectedweapon.value) return;
  
    const weaponId = selectedweapon.value.game_id;
  
    // 설정값 업데이트
    plannerStore.updateweaponSettings(weaponId, currentSettings.value);
  
    console.log('Updated Settings:', currentSettings.value);
  
    // 재료 계산 및 목표 업데이트
    const calculatedMaterials = plannerStore.calculateAllMaterials(weaponId, "weapon");
  
    plannerStore.addGoal({
      id: selectedweapon.value.game_id,
      type: 'weapon',
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
    /* 너비 설정 */
    aspect-ratio: 1 / 1;
    /* 정사각형 비율 유지 */
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