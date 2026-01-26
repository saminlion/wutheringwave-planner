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
                    <div class="section-title">SKILLS</div>
                    <div class="skills-layout">
                        <!-- Left: Skill Controls -->
                        <div class="skills-left">
                            <!-- Combat Skills -->
                            <div v-for="(skill, index) in characterSkills" :key="skill.model_value" class="skill-row">
                                <span :class="['skill-badge', `badge-${index}`]">{{ getSkillBadge(index) }}</span>
                                <span class="skill-name">{{ skill.label }}</span>
                                <div class="skill-controls">
                                    <select
                                        class="skill-select"
                                        :value="getSkillValue(skill, 'current')"
                                        @change="setSkillLevel(skill, 'current', Number($event.target.value))"
                                    >
                                        <option v-for="n in skill.maxLevel" :key="n" :value="n">{{ n }}</option>
                                    </select>
                                    <span class="skill-arrow">>></span>
                                    <select
                                        class="skill-select"
                                        :value="getSkillValue(skill, 'target')"
                                        @change="setSkillLevel(skill, 'target', Number($event.target.value))"
                                    >
                                        <option v-for="n in skill.maxLevel" :key="n" :value="n">{{ n }}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Mastery Section -->
                            <div class="subsection-title">Mastery</div>
                            <div v-for="(skill, index) in characterSkills" :key="'mastery-' + skill.model_value" class="skill-row">
                                <span :class="['skill-badge', `badge-${index}`]">M</span>
                                <span class="skill-name">{{ skill.label }}</span>
                                <div class="skill-controls">
                                    <select
                                        class="skill-select"
                                        :value="getMasteryValue(skill, 'current')"
                                        @change="setMastery(skill, 'current', Number($event.target.value))"
                                    >
                                        <option v-for="n in (skill.maxMasteryLevel + 1)" :key="n - 1" :value="n - 1">{{ n - 1 }}</option>
                                    </select>
                                    <span class="skill-arrow">>></span>
                                    <select
                                        class="skill-select"
                                        :value="getMasteryValue(skill, 'target')"
                                        @change="setMastery(skill, 'target', Number($event.target.value))"
                                    >
                                        <option v-for="n in (skill.maxMasteryLevel + 1)" :key="n - 1" :value="n - 1">{{ n - 1 }}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Talent -->
                            <div class="subsection-title">Talent</div>
                            <div v-for="(skill, index) in characterSpecial" :key="skill.model_value" class="skill-row">
                                <span class="skill-badge badge-talent">T</span>
                                <span class="skill-name">{{ skill.label }}</span>
                                <div class="skill-controls">
                                    <select
                                        class="skill-select"
                                        :value="getSpecialValue(skill, 'current')"
                                        @change="setSpecialLevel(skill, 'current', Number($event.target.value))"
                                    >
                                        <option v-for="n in (skill.maxLevel + 1)" :key="n - 1" :value="n - 1">{{ n - 1 }}</option>
                                    </select>
                                    <span class="skill-arrow">>></span>
                                    <select
                                        class="skill-select"
                                        :value="getSpecialValue(skill, 'target')"
                                        @change="setSpecialLevel(skill, 'target', Number($event.target.value))"
                                    >
                                        <option v-for="n in (skill.maxLevel + 1)" :key="n - 1" :value="n - 1">{{ n - 1 }}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Base Skill -->
                            <div class="subsection-title">Base Skill</div>
                            <div v-for="(skill, index) in characterBaseSkill" :key="skill.model_value" class="skill-row">
                                <span class="skill-badge badge-base">B</span>
                                <span class="skill-name">{{ skill.label }}</span>
                                <div class="skill-controls">
                                    <select
                                        class="skill-select"
                                        :value="getBaseSkillValue(skill, 'current')"
                                        @change="setBaseSkillLevel(skill, 'current', Number($event.target.value))"
                                    >
                                        <option v-for="n in (skill.maxLevel + 1)" :key="n - 1" :value="n - 1">{{ n - 1 }}</option>
                                    </select>
                                    <span class="skill-arrow">>></span>
                                    <select
                                        class="skill-select"
                                        :value="getBaseSkillValue(skill, 'target')"
                                        @change="setBaseSkillLevel(skill, 'target', Number($event.target.value))"
                                    >
                                        <option v-for="n in (skill.maxLevel + 1)" :key="n - 1" :value="n - 1">{{ n - 1 }}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Attribute Checklist -->
                        <div class="skills-right">
                            <div class="checklist-title">Attributes</div>
                            <div v-for="attr in characterAttributes" :key="attr.model_value" class="checklist-item">
                                <span class="checklist-label">{{ attr.label }}</span>
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
 * Endfield専用キャラクターダイアログ (ドロップダウン版)
 */
import { ref, computed } from 'vue';
import { useLocale } from '@/composables/useLocale';
import { useGameStore } from '@/store/game';
import { calculateLevelMaterials, calculateSkillMaterials } from '@/services/materialHelper/character';
import { getMaterialFieldById } from '@/services/materialHelper/dbUtils';

const { tUI, tCharacter, tMaterial } = useLocale();
const gameStore = useGameStore();

const props = defineProps({
    visible: Boolean,
    character: Object,
    settings: Object,
    levelItems: Array,
});

// Form fields from config
const characterSkills = computed(() => gameStore.formFields?.characterSkills || []);
const characterSpecial = computed(() => gameStore.formFields?.characterSpecial || []);
const characterBaseSkill = computed(() => gameStore.formFields?.characterBaseSkill || []);
const characterAttributes = computed(() => gameStore.formFields?.characterAttributes || []);

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
        return calculateSkillMaterials(props.settings, props.character) || {};
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
const hasLevelMaterials = computed(() => Object.keys(filterMaterials(levelMaterials.value)).length > 0);
const hasSkillMaterials = computed(() => Object.keys(filterMaterials(skillMaterials.value)).length > 0);

// Level helpers
const updateLevel = (type, value) => {
    const key = type === 'current' ? 'currentLevel' : 'targetLevel';
    props.settings[key] = value;
    updateCharacter();
};

// Skill badge
const getSkillBadge = (index) => ['B', 'S', 'C', 'U'][index] || '?';

// --- Combat Skills ヘルパー (未初期化対応) ---
const getSkillValue = (skill, type) => {
    const key = type === 'current' ? 'current_level' : 'target_level';
    if (!props.settings.skills) {
        props.settings.skills = {};
    }
    if (!props.settings.skills[skill.model_value]) {
        props.settings.skills[skill.model_value] = {
            current_level: 1,
            target_level: 1,
            current_mastery: 0,
            target_mastery: 0,
        };
    }
    return props.settings.skills[skill.model_value][key];
};

const setSkillLevel = (skill, type, value) => {
    const skillData = props.settings.skills[skill.model_value];
    const key = type === 'current' ? 'current_level' : 'target_level';
    skillData[key] = value;

    // 自動調整: current > target の場合
    if (type === 'current' && value > skillData.target_level) {
        skillData.target_level = value;
    }
    if (type === 'target' && value < skillData.current_level) {
        skillData.current_level = value;
    }
    updateCharacter();
};

// --- Mastery ヘルパー ---
const getMasteryValue = (skill, type) => {
    const key = type === 'current' ? 'current_mastery' : 'target_mastery';
    if (!props.settings.skills) {
        props.settings.skills = {};
    }
    if (!props.settings.skills[skill.model_value]) {
        props.settings.skills[skill.model_value] = {
            current_level: 1,
            target_level: 1,
            current_mastery: 0,
            target_mastery: 0,
        };
    }
    return props.settings.skills[skill.model_value][key];
};

const setMastery = (skill, type, value) => {
    const skillData = props.settings.skills[skill.model_value];
    const key = type === 'current' ? 'current_mastery' : 'target_mastery';
    skillData[key] = value;

    if (type === 'current' && value > skillData.target_mastery) {
        skillData.target_mastery = value;
    }
    if (type === 'target' && value < skillData.current_mastery) {
        skillData.current_mastery = value;
    }
    updateCharacter();
};

// --- Talent (Special) ヘルパー ---
const getSpecialValue = (skill, type) => {
    const key = type === 'current' ? 'current_level' : 'target_level';
    if (!props.settings.special) {
        props.settings.special = {};
    }
    if (!props.settings.special[skill.model_value]) {
        props.settings.special[skill.model_value] = {
            current_level: 0,
            target_level: 0,
        };
    }
    return props.settings.special[skill.model_value][key];
};

const setSpecialLevel = (skill, type, value) => {
    const specialData = props.settings.special[skill.model_value];
    const key = type === 'current' ? 'current_level' : 'target_level';
    specialData[key] = value;

    if (type === 'current' && value > specialData.target_level) {
        specialData.target_level = value;
    }
    if (type === 'target' && value < specialData.current_level) {
        specialData.current_level = value;
    }
    updateCharacter();
};

// --- Base Skill ヘルパー ---
const getBaseSkillValue = (skill, type) => {
    const key = type === 'current' ? 'current_level' : 'target_level';
    if (!props.settings.baseSkill) {
        props.settings.baseSkill = {};
    }
    if (!props.settings.baseSkill[skill.model_value]) {
        props.settings.baseSkill[skill.model_value] = {
            current_level: 0,
            target_level: 0,
        };
    }
    return props.settings.baseSkill[skill.model_value][key];
};

const setBaseSkillLevel = (skill, type, value) => {
    const baseSkillData = props.settings.baseSkill[skill.model_value];
    const key = type === 'current' ? 'current_level' : 'target_level';
    baseSkillData[key] = value;

    if (type === 'current' && value > baseSkillData.target_level) {
        baseSkillData.target_level = value;
    }
    if (type === 'target' && value < baseSkillData.current_level) {
        baseSkillData.current_level = value;
    }
    updateCharacter();
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
    width: 700px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Header */
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

.header-spacer {
    flex: 1;
}

/* Tabs */
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

.tab-btn:hover {
    color: var(--text-primary, #333);
}

.tab-icon {
    margin-right: 6px;
}

/* Content */
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

.subsection-title {
    color: var(--text-secondary, #666);
    font-size: 12px;
    margin: 16px 0 8px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border-color, #ddd);
}

/* Level Section */
.level-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
}

.level-control {
    text-align: center;
}

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

.level-select:hover {
    border-color: var(--accent-color, #4a90e2);
}

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

.skills-left {
    flex: 2;
}

.skills-right {
    flex: 1;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
    padding: 12px;
}

/* Skill Row */
.skill-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color, #eee);
}

.skill-badge {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
}

.badge-0 { background: #4a90d9; }
.badge-1 { background: #d94a4a; }
.badge-2 { background: #4ad94a; }
.badge-3 { background: #d9d94a; }
.badge-talent { background: #9b59b6; }
.badge-base { background: #3498db; }

.skill-name {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary, #333);
}

.skill-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.skill-select {
    width: 60px;
    padding: 6px 8px;
    background: var(--bg-secondary, #f5f5f5);
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    color: var(--text-primary, #333);
    cursor: pointer;
}

.skill-select:hover {
    border-color: var(--accent-color, #4a90e2);
}

.skill-select:focus {
    outline: none;
    border-color: var(--accent-color, #4a90e2);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.skill-arrow {
    color: var(--accent-color, #4a90e2);
    font-size: 14px;
    font-weight: bold;
}

/* Checklist */
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

/* Materials Section */
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
