<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-container">
            <!-- Header -->
            <div class="dialog-header">
                <button class="back-btn" @click="closeDialog">&lt;</button>
                <img :src="character?.icon || ''" class="character-avatar" />
                <span class="character-name">{{ tCharacter(character?.game_id, character?.display_name) || 'Unknown' }}</span>
                <div class="header-spacer"></div>
                <button class="close-btn" @click="closeDialog">X</button>
            </div>

            <!-- Tabs -->
            <div class="tabs">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    :class="['tab-btn', { active: currentTab === tab.id }]"
                    @click="currentTab = tab.id"
                >
                    <span class="tab-icon">{{ tab.icon }}</span>
                    {{ tab.label }}
                </button>
            </div>

            <!-- Content -->
            <div class="dialog-content">
                <!-- Level Tab -->
                <div v-if="currentTab === 'level'" class="tab-content">
                    <div class="section-title">LEVEL</div>
                    <div class="level-section">
                        <div class="level-control">
                            <span class="level-label">Current Level</span>
                            <select
                                class="level-select"
                                :value="settings.currentLevel"
                                @change="updateLevel('current', $event.target.value)"
                            >
                                <option
                                    v-for="item in levelItems"
                                    :key="item.value"
                                    :value="item.value"
                                >
                                    {{ item.label }}
                                </option>
                            </select>
                        </div>
                        <span class="level-arrow">>></span>
                        <div class="level-control">
                            <span class="level-label">Goal Level</span>
                            <select
                                class="level-select"
                                :value="settings.targetLevel"
                                @change="updateLevel('target', $event.target.value)"
                            >
                                <option
                                    v-for="item in levelItems"
                                    :key="item.value"
                                    :value="item.value"
                                >
                                    {{ item.label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Level Materials Display -->
                    <div v-if="hasLevelMaterials" class="materials-section">
                        <div class="materials-title">Required Materials</div>
                        <div class="materials-grid">
                            <div v-for="(qty, matId) in filterMaterials(levelMaterials)" :key="matId" class="material-item">
                                <img v-if="getMaterialIcon(matId)" :src="getMaterialIcon(matId)" class="material-icon" />
                                <span class="material-qty">{{ qty }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="no-materials">
                        <span>No materials needed</span>
                    </div>
                </div>

                <!-- Skills Tab -->
                <div v-if="currentTab === 'skills'" class="tab-content">
                    <div class="skills-layout">
                        <!-- Left: Passive Skills -->
                        <div class="skills-left">
                            <div class="checklist-title">Passive Skills</div>
                            <div v-for="passive in characterSpecial" :key="passive.model_value" class="checklist-item">
                                <span class="checklist-label">{{ passive.label }}</span>
                                <label class="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        :checked="getPassiveChecked(passive)"
                                        @change="togglePassive(passive, $event.target.checked)"
                                    />
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Right: Bonus Stats (4-star only) -->
                        <div v-if="hasBonusStats" class="skills-right">
                            <div class="checklist-title">Bonus Stats</div>
                            <div v-for="(attr, index) in characterAttributes" :key="attr.model_value" class="checklist-item">
                                <span class="checklist-label">
                                    {{ getBonusStatLabel(index) }}
                                </span>
                                <label class="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        v-model="settings.attributes[attr.model_value]"
                                        @change="updateCharacter"
                                    />
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Skill Materials Display -->
                    <div v-if="hasSkillMaterials" class="materials-section">
                        <div class="materials-title">Required Materials</div>
                        <div class="materials-grid">
                            <div v-for="(qty, matId) in filterMaterials(skillMaterials)" :key="matId" class="material-item">
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
/**
 * GFL2 Character Dialog
 * - Level tab: current/target level
 * - Skills tab: 6 passive checkboxes + 6 bonus stat checkboxes (4-star only)
 */
import { ref, computed } from 'vue';
import { useLocale } from '@/composables/useLocale';
import { useGameStore } from '@/store/game';
import { calculateLevelMaterials, calculatePassiveMaterials } from '@/services/materialHelper/character';
import { getMaterialFieldById } from '@/services/materialHelper/dbUtils';

const { tCharacter } = useLocale();
const gameStore = useGameStore();

const props = defineProps({
    visible: Boolean,
    character: Object,
    settings: Object,
    levelItems: Array,
});

const characterSpecial = computed(() => gameStore.formFields?.characterSpecial || []);
const characterAttributes = computed(() => gameStore.formFields?.characterAttributes || []);

// 4-star characters have bonus_stats
const hasBonusStats = computed(() => {
    return props.character?.bonus_stats && props.character.bonus_stats.length > 0;
});

const tabs = [
    { id: 'level', label: 'LEVEL', icon: '⬆' },
    { id: 'skills', label: 'SKILLS', icon: '⚔' },
];
const currentTab = ref('level');

const emit = defineEmits(['close', 'updateCharacter']);

const closeDialog = () => emit('close');
const updateCharacter = () => emit('updateCharacter');

// Material calculations
const levelMaterials = computed(() => {
    if (!props.character || !props.settings) return {};
    try {
        return calculateLevelMaterials(props.settings, props.character) || {};
    } catch (e) {
        return {};
    }
});

const skillMaterials = computed(() => {
    if (!props.character || !props.settings) return {};
    try {
        return calculatePassiveMaterials(props.settings, props.character) || {};
    } catch (e) {
        return {};
    }
});

const getMaterialIcon = (materialId) => getMaterialFieldById(materialId, 'icon');

const filterMaterials = (materials) => {
    const filtered = {};
    Object.entries(materials || {}).forEach(([id, qty]) => {
        if (id !== 'processed' && qty > 0) {
            filtered[id] = qty;
        }
    });
    return filtered;
};

const hasLevelMaterials = computed(() => Object.keys(filterMaterials(levelMaterials.value)).length > 0);
const hasSkillMaterials = computed(() => Object.keys(filterMaterials(skillMaterials.value)).length > 0);

// Level helpers
const updateLevel = (type, value) => {
    const key = type === 'current' ? 'currentLevel' : 'targetLevel';
    props.settings[key] = value;
    updateCharacter();
};

// Passive helpers (special: { passive_1: { current_level: 0, target_level: 0|1 } })
const getPassiveChecked = (passive) => {
    if (!props.settings.special) props.settings.special = {};
    if (!props.settings.special[passive.model_value]) {
        props.settings.special[passive.model_value] = { current_level: 0, target_level: 0 };
    }
    return props.settings.special[passive.model_value].target_level > 0;
};

const togglePassive = (passive, checked) => {
    if (!props.settings.special) props.settings.special = {};
    if (!props.settings.special[passive.model_value]) {
        props.settings.special[passive.model_value] = { current_level: 0, target_level: 0 };
    }
    props.settings.special[passive.model_value].target_level = checked ? 1 : 0;
    updateCharacter();
};

// Bonus stat label from character data
const getBonusStatLabel = (index) => {
    const bonusStats = props.character?.bonus_stats;
    if (bonusStats && bonusStats[index]) {
        const stat = bonusStats[index];
        const pct = stat.value >= 1 ? stat.value : `${(stat.value * 100).toFixed(1)}%`;
        return `${formatStatName(stat.stat)} +${pct}`;
    }
    return `Bonus Stat ${index + 1}`;
};

const formatStatName = (stat) => {
    return stat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
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
    z-index: 1000;
}

.dialog-container {
    background: var(--bg-primary, #fff);
    border-radius: 12px;
    width: 600px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-secondary, #f5f5f5);
    gap: 12px;
    border-bottom: 1px solid var(--border-color, #ddd);
}

.back-btn, .close-btn {
    background: var(--btn-secondary, #e0e0e0);
    border: none;
    color: var(--text-primary, #333);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
}

.back-btn:hover, .close-btn:hover {
    background: var(--btn-secondary-hover, #d0d0d0);
}

.character-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--accent-color, #4a90e2);
}

.character-name {
    color: var(--text-primary, #333);
    font-size: 18px;
    font-weight: bold;
}

.header-spacer { flex: 1; }

.tabs {
    display: flex;
    padding: 0 16px;
    gap: 8px;
    background: var(--bg-secondary, #f5f5f5);
}

.tab-btn {
    padding: 12px 24px;
    background: transparent;
    border: none;
    color: var(--text-secondary, #666);
    cursor: pointer;
    font-size: 14px;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
}

.tab-btn.active {
    color: var(--accent-color, #4a90e2);
    border-bottom-color: var(--accent-color, #4a90e2);
}

.tab-btn:hover { color: var(--text-primary, #333); }
.tab-icon { margin-right: 6px; }

.dialog-content {
    padding: 20px;
    overflow-y: auto;
    max-height: calc(85vh - 140px);
}

.section-title {
    text-align: center;
    color: var(--accent-color, #4a90e2);
    font-size: 14px;
    margin-bottom: 20px;
    padding: 8px;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 4px;
}

.level-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
}

.level-control { text-align: center; }

.level-label {
    display: block;
    color: var(--text-secondary, #666);
    font-size: 12px;
    margin-bottom: 8px;
}

.level-select {
    min-width: 160px;
    padding: 10px 16px;
    background: var(--bg-secondary, #f5f5f5);
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    color: var(--text-primary, #333);
    cursor: pointer;
}

.level-select:hover { border-color: var(--accent-color, #4a90e2); }
.level-select:focus {
    outline: none;
    border-color: var(--accent-color, #4a90e2);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.level-arrow {
    color: var(--accent-color, #4a90e2);
    font-size: 20px;
    font-weight: bold;
}

/* Skills Layout */
.skills-layout {
    display: flex;
    gap: 24px;
}

.skills-left { flex: 1; }

.skills-right {
    flex: 1;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
    padding: 12px;
}

.checklist-title {
    color: var(--accent-color, #4a90e2);
    font-size: 12px;
    margin-bottom: 12px;
    text-align: center;
    font-weight: bold;
}

.checklist-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color, #eee);
}

.checklist-label {
    font-size: 12px;
    color: var(--text-primary, #333);
}

.checkbox-wrapper {
    position: relative;
    cursor: pointer;
}

.checkbox-wrapper input {
    opacity: 0;
    position: absolute;
}

.checkmark {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
}

.checkbox-wrapper input:checked + .checkmark {
    background: var(--success-color, #4ad94a);
    border-color: var(--success-color, #4ad94a);
}

.checkbox-wrapper input:checked + .checkmark::after {
    content: '✓';
    display: block;
    text-align: center;
    color: #fff;
    font-size: 14px;
    line-height: 20px;
}

.materials-section {
    margin-top: 20px;
    padding: 12px;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
}

.materials-title {
    font-size: 12px;
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
    gap: 4px;
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
    margin-top: 20px;
    padding: 16px;
    text-align: center;
    color: var(--text-secondary, #999);
    font-size: 13px;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
}
</style>
