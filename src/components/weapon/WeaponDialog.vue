<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-container">
            <div class="dialog-header" :style="headerGradient">
                <img :src="weapon?.icon || ''" :alt="tWeapon(weapon?.game_id, weapon?.display_name) || 'Unknown'" class="weapon-avatar" />
                <span class="weapon-name">{{ tWeapon(weapon?.game_id, weapon?.display_name) || 'Unknown' }}</span>
                <div class="header-spacer"></div>
                <button class="close-btn" @click="closeDialog">✕</button>
            </div>

            <div class="dialog-content scrollable">
                <div class="section-title">Level</div>
                <div class="level-section">
                    <div class="level-control">
                        <span class="level-label">Current</span>
                        <select
                            class="level-select"
                            :value="settings?.currentLevel || '1'"
                            @change="onLevelChange('current', $event.target.value)"
                        >
                            <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                {{ item.label }}
                            </option>
                        </select>
                    </div>
                    <span class="level-arrow">→</span>
                    <div class="level-control">
                        <span class="level-label">Target</span>
                        <select
                            class="level-select"
                            :value="settings?.targetLevel || '1'"
                            @change="onLevelChange('target', $event.target.value)"
                        >
                            <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                {{ item.label }}
                            </option>
                        </select>
                    </div>
                </div>

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

                <div class="tab-footer">
                    <button class="complete-tab-btn" @click="completeLevel">✓ Complete Level</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLocale } from '@/composables/useLocale';
import { calculateWeaponMaterials } from '@/services/materialHelper/weapon';
import { getMaterialFieldById } from '@/services/materialHelper/dbUtils';
import { useGameStore } from '@/store/game';

const { tUI, tWeapon } = useLocale();
const gameStore = useGameStore();

const props = defineProps({
    visible: Boolean,
    weapon: Object,
    settings: Object,
    levelItems: Array,
});

const emit = defineEmits(['close', 'updateweapon', 'completeTab']);

const closeDialog = () => emit('close');

const headerGradient = computed(() => {
    const config = gameStore.currentGame?.config;
    if (!config || !props.weapon) return {};
    const rarity = props.weapon.rarity;
    const type = props.weapon.type || props.weapon.weapon_type;
    const rarityColor = config.themeColors?.rarity?.[rarity] || '#6B60B5';
    const typeColor = config.themeColors?.weaponType?.[type] || config.themeColors?.element?.['fire'] || '#888';
    return { background: `linear-gradient(135deg, ${rarityColor} 0%, ${typeColor} 100%)` };
});

const weaponMaterials = computed(() => {
    if (!props.weapon || !props.settings) return {};
    try {
        return calculateWeaponMaterials(props.settings, props.weapon, props.weapon?.rarity) || {};
    } catch {
        return {};
    }
});

const getMaterialIcon = (materialId) => getMaterialFieldById(materialId, 'icon');

const filterMaterials = (materials) => {
    const filtered = {};
    Object.entries(materials || {}).forEach(([id, qty]) => {
        if (id !== 'processed' && qty > 0) filtered[id] = qty;
    });
    return filtered;
};

const hasMaterials = computed(() => Object.keys(filterMaterials(weaponMaterials.value)).length > 0);

const onLevelChange = (type, value) => {
    if (!props.settings) return;
    const key = type === 'current' ? 'currentLevel' : 'targetLevel';
    props.settings[key] = value;

    const items = props.levelItems || [];
    const currentIdx = items.findIndex(item => item.value === props.settings.currentLevel);
    const targetIdx = items.findIndex(item => item.value === props.settings.targetLevel);
    if (currentIdx > targetIdx) {
        props.settings[type === 'current' ? 'targetLevel' : 'currentLevel'] = value;
    }
    emit('updateweapon');
};

const completeLevel = () => {
    emit('completeTab', {
        tabType: 'level',
        materials: weaponMaterials.value,
        settingsUpdate: { currentLevel: props.settings.targetLevel },
    });
};
</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog-container {
    background: var(--bg-primary, #fff);
    border-radius: 12px;
    width: 480px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px 12px 0 0;
}

.weapon-avatar {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    object-fit: cover;
}

.weapon-name {
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.header-spacer { flex: 1; }

.close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}
.close-btn:hover { background: rgba(255, 255, 255, 0.35); }

.dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.section-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-secondary, #666);
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border-color, #eee);
}

.level-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.level-control {
    flex: 1;
}

.level-label {
    display: block;
    font-size: 11px;
    color: var(--text-secondary, #666);
    margin-bottom: 6px;
}

.level-select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 6px;
    background: var(--bg-secondary, #f5f5f5);
    color: var(--text-primary, #333);
    font-size: 13px;
    cursor: pointer;
}
.level-select:focus {
    outline: none;
    border-color: var(--accent-color, #4a90e2);
}

.level-arrow {
    color: var(--accent-color, #4a90e2);
    font-size: 20px;
    font-weight: bold;
    margin-top: 16px;
}

.materials-section {
    padding: 14px;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
    margin-bottom: 16px;
}

.materials-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary, #666);
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
    gap: 6px;
    padding: 6px 10px;
    background: var(--bg-primary, #fff);
    border-radius: 6px;
    border: 1px solid var(--border-color, #ddd);
}

.material-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.material-qty {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #333);
}

.no-materials {
    padding: 20px;
    text-align: center;
    color: var(--text-secondary, #999);
    font-size: 13px;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
    margin-bottom: 16px;
}

.tab-footer {
    display: flex;
    justify-content: flex-end;
}

.complete-tab-btn {
    padding: 8px 20px;
    background: var(--accent-color, #4a90e2);
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: opacity 0.2s;
}
.complete-tab-btn:hover { opacity: 0.85; }
</style>
