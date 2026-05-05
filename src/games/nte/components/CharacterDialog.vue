<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-container">
            <!-- Header -->
            <div class="dialog-header">
                <img :src="character?.icon || ''" :alt="character?.display_name" class="character-avatar" />
                <span class="character-name">{{ tCharacter(character?.game_id, character?.display_name) || 'Unknown' }}</span>
                <div class="header-spacer"></div>
                <button class="close-btn" @click="closeDialog">✕</button>
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
                <div v-if="currentTab === 'level'">
                    <div class="section-title">Character Level</div>
                    <div class="level-section">
                        <div class="level-control">
                            <span class="level-label">Current</span>
                            <select
                                class="level-select"
                                :value="settings.currentLevel"
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
                                :value="settings.targetLevel"
                                @change="onLevelChange('target', $event.target.value)"
                            >
                                <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                    {{ item.label }}
                                </option>
                            </select>
                        </div>
                    </div>

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
                <div v-if="currentTab === 'skills'">
                    <!-- Active Skills -->
                    <div class="subsection-title">Active Skills</div>
                    <div v-for="(skill, index) in activeSkills" :key="'active-' + index" class="skill-row">
                        <div class="skill-badge" :class="'badge-active-' + index">{{ index + 1 }}</div>
                        <span class="skill-name">{{ skill.label }}</span>
                        <div class="skill-controls">
                            <select
                                class="skill-select"
                                :value="getActiveValue(skill, 'current')"
                                @change="onActiveSkillChange(skill, 'current', Number($event.target.value))"
                            >
                                <option v-for="lvl in 10" :key="lvl" :value="lvl">{{ lvl }}</option>
                            </select>
                            <span class="skill-arrow">→</span>
                            <select
                                class="skill-select"
                                :value="getActiveValue(skill, 'target')"
                                @change="onActiveSkillChange(skill, 'target', Number($event.target.value))"
                            >
                                <option v-for="lvl in 10" :key="lvl" :value="lvl">{{ lvl }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Passive Skills (0 = locked, 1 = unlocked) -->
                    <div class="subsection-title">Passive Skills</div>
                    <div v-for="(skill, index) in passiveSkills" :key="'passive-' + index" class="skill-row">
                        <div class="skill-badge badge-passive">P{{ index + 1 }}</div>
                        <span class="skill-name">{{ skill.label }}</span>
                        <div class="skill-controls">
                            <select
                                class="skill-select"
                                :value="getPassiveValue(skill, 'current')"
                                @change="onPassiveSkillChange(skill, 'current', Number($event.target.value))"
                            >
                                <option v-for="lvl in getPassiveLevels(skill)" :key="lvl" :value="lvl">
                                    {{ lvl === 0 ? 'Locked' : 'Unlocked' }}
                                </option>
                            </select>
                            <span class="skill-arrow">→</span>
                            <select
                                class="skill-select"
                                :value="getPassiveValue(skill, 'target')"
                                @change="onPassiveSkillChange(skill, 'target', Number($event.target.value))"
                            >
                                <option v-for="lvl in getPassiveLevels(skill)" :key="lvl" :value="lvl">
                                    {{ lvl === 0 ? 'Locked' : 'Unlocked' }}
                                </option>
                            </select>
                        </div>
                    </div>

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
import { ref, computed } from 'vue';
import { useLocale } from '@/composables/useLocale';
import { calculateLevelMaterials, calculateSkillMaterials, calculatePassiveMaterials } from '@/services/materialHelper/character';
import { getMaterialFieldById } from '@/services/materialHelper/dbUtils';

const { tCharacter, tMaterial } = useLocale();

const props = defineProps({
    visible: Boolean,
    character: Object,
    settings: Object,
    levelItems: Array,
    activeSkills: Array,
    passiveSkills: Array,
});

const tabs = [
    { id: 'level', label: 'Level', icon: '📊' },
    { id: 'skills', label: 'Skills', icon: '⚔️' },
];
const currentTab = ref('level');

const emit = defineEmits(['close', 'updateCharacter']);

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
        const active = calculateSkillMaterials(props.settings, props.character) || {};
        const passive = calculatePassiveMaterials(props.settings, props.character) || {};
        const merged = { ...active };
        Object.entries(passive).forEach(([id, qty]) => {
            merged[id] = (merged[id] || 0) + qty;
        });
        return merged;
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

const closeDialog = () => emit('close');
const updateCharacter = () => emit('updateCharacter');

const getPassiveLevels = (skill) => {
    const min = skill.min ?? 0;
    const max = skill.max ?? 1;
    const levels = [];
    for (let i = min; i <= max; i++) levels.push(i);
    return levels;
};

const getActiveValue = (skill, type) => {
    const key = `${skill.model_value}_${type}_level`;
    if (!props.settings.activeSkills) props.settings.activeSkills = {};
    if (props.settings.activeSkills[key] === undefined) props.settings.activeSkills[key] = 1;
    return props.settings.activeSkills[key];
};

const getPassiveValue = (skill, type) => {
    const key = `${skill.model_value}_${type}_level`;
    if (!props.settings.passiveSkills) props.settings.passiveSkills = {};
    if (props.settings.passiveSkills[key] === undefined) props.settings.passiveSkills[key] = skill.min ?? 0;
    return props.settings.passiveSkills[key];
};

const onLevelChange = (type, value) => {
    const items = props.levelItems;
    props.settings[type === 'current' ? 'currentLevel' : 'targetLevel'] = value;

    const currentIdx = items.findIndex(item => item.value === props.settings.currentLevel);
    const targetIdx = items.findIndex(item => item.value === props.settings.targetLevel);

    if (currentIdx > targetIdx) {
        if (type === 'current') props.settings.targetLevel = props.settings.currentLevel;
        else props.settings.currentLevel = props.settings.targetLevel;
    }
    updateCharacter();
};

const onActiveSkillChange = (skill, type, value) => {
    const currentKey = `${skill.model_value}_current_level`;
    const targetKey = `${skill.model_value}_target_level`;

    if (type === 'current') {
        props.settings.activeSkills[currentKey] = value;
        if (value > props.settings.activeSkills[targetKey]) props.settings.activeSkills[targetKey] = value;
    } else {
        props.settings.activeSkills[targetKey] = value;
        if (value < props.settings.activeSkills[currentKey]) props.settings.activeSkills[currentKey] = value;
    }
    updateCharacter();
};

const onPassiveSkillChange = (skill, type, value) => {
    const currentKey = `${skill.model_value}_current_level`;
    const targetKey = `${skill.model_value}_target_level`;

    if (type === 'current') {
        props.settings.passiveSkills[currentKey] = value;
        if (value > props.settings.passiveSkills[targetKey]) props.settings.passiveSkills[targetKey] = value;
    } else {
        props.settings.passiveSkills[targetKey] = value;
        if (value < props.settings.passiveSkills[currentKey]) props.settings.passiveSkills[currentKey] = value;
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

.close-btn {
    background: var(--btn-secondary, #e0e0e0);
    border: none;
    color: var(--text-primary, #333);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
}

.close-btn:hover {
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

.subsection-title {
    color: var(--text-secondary, #666);
    font-size: 12px;
    margin: 16px 0 8px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border-color, #ddd);
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
    padding: 10px 16px;
    font-size: 16px;
    font-weight: bold;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 6px;
    background: var(--bg-secondary, #f5f5f5);
    color: var(--text-primary, #333);
    cursor: pointer;
    min-width: 120px;
}

.level-select:focus {
    outline: none;
    border-color: var(--accent-color, #4a90e2);
}

.level-arrow {
    color: var(--accent-color, #4a90e2);
    font-size: 20px;
    font-weight: bold;
}

.skill-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color, #eee);
}

.skill-badge {
    width: 28px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    flex-shrink: 0;
}

/* NTE active skill colors match element palette */
.badge-active-0 { background: #E04778; } /* incantation */
.badge-active-1 { background: #38C297; } /* anima */
.badge-active-2 { background: #6A71F4; } /* psyche */
.badge-active-3 { background: #DDCB68; color: #333; } /* lakshana */
.badge-passive  { background: #A36EDB; }

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
    padding: 6px 12px;
    font-size: 14px;
    font-weight: bold;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
    background: var(--bg-secondary, #f5f5f5);
    color: var(--text-primary, #333);
    cursor: pointer;
    min-width: 60px;
    text-align: center;
}

.skill-select:focus {
    outline: none;
    border-color: var(--accent-color, #4a90e2);
}

.skill-arrow {
    color: var(--accent-color, #4a90e2);
    font-size: 14px;
    font-weight: bold;
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
