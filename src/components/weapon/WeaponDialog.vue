<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="gradient-border" :style="setGradientStyle(weapon, true)">
            <div class="dialog-content">
                <div class="header-section">
                    <div class="weapon-info">
                        <h2>{{ tWeapon(weapon?.game_id, weapon?.display_name) || 'Unknown' }}</h2> <!-- 武器名 -->
                        <img :src="weapon?.icon || ''" :alt="tWeapon(weapon?.game_id, weapon?.display_name) || 'Unknown'" width="50" />
                        <!-- 武器アイコン -->
                    </div>

                    <button class="close-dialog" @click="closeDialog">{{ tUI('common.close') }}</button> <!-- Close 버튼 -->
                </div>
                <div class="setting-section scrollable">
                        <h3>Level</h3>
                        <div class="level-row">
                            <label>
                                Current Level:
                                <select
                                    :value="settings?.currentLevel || '1'"
                                    @change="onLevelChange('current', $event.target.value)"
                                >
                                    <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </label>
                            <span class="level-arrow">→</span>
                            <label>
                                Target Level:
                                <select
                                    :value="settings?.targetLevel || '1'"
                                    @change="onLevelChange('target', $event.target.value)"
                                >
                                    <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </label>
                        </div>

                        <!-- Weapon Materials Display -->
                        <div v-if="hasMaterials" class="materials-section">
                            <div class="materials-title">Required Materials</div>
                            <div class="materials-grid">
                                <div v-for="(qty, matId) in filterMaterials(weaponMaterials)" :key="matId" class="material-item">
                                    <img v-if="getMaterialIcon(matId)" :src="getMaterialIcon(matId)" class="material-icon" />
                                    <span class="material-qty">{{ qty }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-materials">
                            <span>No materials needed</span>
                        </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { setGradientStyle } from '../../services/utils';
import { useLocale } from '@/composables/useLocale';
import { calculateWeaponMaterials } from '@/services/materialHelper/weapon';
import { getMaterialFieldById } from '@/services/materialHelper/dbUtils';

// i18n翻訳関数を取得
const { tUI, tWeapon, tMaterial } = useLocale();

const props = defineProps({
    visible: Boolean,
    weapon: Object,
    settings: Object,
    levelItems: Array,
    activeSkills: Array,
    passiveSkills: Object,
});

const expandedTiers = ref([]); // 열려있는 Tier의 인덱스를 저장

const emit = defineEmits(['close', 'updateweapon']);

const closeDialog = () => {
    emit('close');
};

const updateweapon = () => {
    emit('updateweapon');
};

// Material calculations
const weaponMaterials = computed(() => {
    if (!props.weapon || !props.settings) return {};
    try {
        return calculateWeaponMaterials(props.settings, props.weapon, props.weapon?.rarity) || {};
    } catch (e) {
        return {};
    }
});

// Helper to get material icon
const getMaterialIcon = (materialId) => {
    return getMaterialFieldById(materialId, 'icon');
};

// Filter out empty/zero quantities and processed marker
const filterMaterials = (materials) => {
    const filtered = {};
    Object.entries(materials || {}).forEach(([id, qty]) => {
        if (id !== 'processed' && qty > 0) {
            filtered[id] = qty;
        }
    });
    return filtered;
};

// Check if materials exist
const hasMaterials = computed(() => Object.keys(filterMaterials(weaponMaterials.value)).length > 0);

/**
 * レベル変更ハンドラ
 * current > target の場合は自動調整
 */
const onLevelChange = (type, value) => {
    if (!props.settings) return;

    const currentKey = type === 'current' ? 'currentLevel' : 'targetLevel';
    props.settings[currentKey] = value;

    // current > target の場合は調整
    const items = props.levelItems || [];
    const currentIdx = items.findIndex(item => item.value === props.settings.currentLevel);
    const targetIdx = items.findIndex(item => item.value === props.settings.targetLevel);

    if (currentIdx > targetIdx) {
        if (type === 'current') {
            props.settings.targetLevel = props.settings.currentLevel;
        } else {
            props.settings.currentLevel = props.settings.targetLevel;
        }
    }

    updateweapon();
};

const toggleTier = (tierIndex) => {
    if (expandedTiers.value.includes(tierIndex)) {
        expandedTiers.value = expandedTiers.value.filter((index) => index !== tierIndex);
    } else {
        expandedTiers.value.push(tierIndex);
    }
};

onMounted(() => {
});

</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.header-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.weapon-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.gradient-border {
    border-radius: 12px;
    padding: 13px;
    background-clip: border-box;
    position: relative;
}

.dialog-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    position: relative;
    width: 600px;
    height: 600px;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
}

.setting-section {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100% - 50px);
}

.level-row {
    display: flex;
    align-items: center;
    gap: 15px;
}

.level-arrow {
    font-size: 1.2rem;
    color: #666;
}

.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.tabs button {
    padding: 10px 20px;
    border: none;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.3s;
}

.tabs button.active {
    background: #4a90e2;
    color: white;
}

.tabs button:hover {
    background: #d0d0d0;
}

.skills-wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.skills-section {
    flex: 1;
    max-width: 100%;
}

.skills-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
}

.skill-card {
    background: #f9f9f9;
    padding: 5px;
    margin-bottom: 0;
    border-radius: 8px;
    text-align: center;
    transform: translateY(-8px); /* 음수 값을 대체 */
}

.collapsible-header {
    background-color: #e0e0e0;
    padding: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    transform: translateY(-20px); /* 음수 값을 대체 */
}

.skill-collapsible-content {
    padding: 0 8px;
    background-color: #f9f9f9;
    border-radius: 2px;
}

.level-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    margin-bottom: 10%;
}

.control-buttons {
    display: flex;
    align-items: center;
    gap: 5px;
}

.control-buttons input {
    width: 40px;
    height: 30px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.control-buttons button {
    width: 30px;
    height: 30px;
    background-color: #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 16px;
    transition: background 0.3s;
}

.control-buttons button:hover {
    background-color: #4a90e2;
    color: white;
}

.divider {
    font-size: 16px;
    font-weight: bold;
}

button.close-dialog {
    padding: 8px 16px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
}

/* Materials Section */
.materials-section {
    margin-top: 20px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
}

.materials-title {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.materials-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.material-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #ddd;
}

.material-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.material-qty {
    font-size: 13px;
    font-weight: 600;
    color: #333;
}

.no-materials {
    margin-top: 20px;
    padding: 16px;
    text-align: center;
    color: #999;
    font-size: 13px;
    background: #f5f5f5;
    border-radius: 8px;
}
</style>