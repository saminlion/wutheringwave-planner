<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="gradient-border" :style="setGradientStyle(character, true)">
            <div class="dialog-content">
                <div class="header-section">
                    <div class="character-info">
                        <h2>{{ tCharacter(character?.game_id, character?.display_name) || 'Unknown' }}</h2>
                        <img :src="character?.icon || ''" :alt="tCharacter(character?.game_id, character?.display_name) || 'Unknown'" width="50" />
                    </div>
                    <button class="close-dialog" @click="closeDialog">{{ tUI('common.close') }}</button>
                </div>
                <div class="tabs">
                    <button v-for="tab in tabs" :key="tab" :class="{ active: currentTab === tab }"
                        @click="currentTab = tab">
                        {{ tab }}
                    </button>
                </div>

                <div class="setting-section scrollable">
                    <!-- Level Tab (공통) -->
                    <div v-if="currentTab === 'Level'">
                        <h3>Level</h3>
                        <div>
                            <label>
                                Current Level:
                                <select v-model="settings.currentLevel" @change="updateCharacter">
                                    <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </label>
                            <label>
                                Target Level:
                                <select v-model="settings.targetLevel" @change="updateCharacter">
                                    <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <!-- Skills Tab - WW -->
                    <div v-if="currentTab === 'Skills' && isWW" class="skills-wrapper">
                        <!-- Active Skills (WW) -->
                        <div class="skills-section">
                            <div class="skills-container">
                                <div v-for="(skill, index) in activeSkills" :key="index" class="skill-card">
                                    <h4>{{ skill.label }}</h4>
                                    <div class="level-controls">
                                        <div class="control-group">
                                            <div class="control-buttons">
                                                <button @click="updateSkillLevel(skill, 'current', 1)">+</button>
                                                <input type="number"
                                                    v-model="settings.activeSkills[`${skill.model_value}_current_level`]"
                                                    :min="1" :max="10" @change="validateSkillLevel(skill, 'current')" />
                                                <button @click="updateSkillLevel(skill, 'current', -1)">-</button>
                                            </div>
                                        </div>
                                        <span class="divider">>> </span>
                                        <div class="control-group">
                                            <div class="control-buttons">
                                                <button @click="updateSkillLevel(skill, 'target', 1)">+</button>
                                                <input type="number"
                                                    v-model="settings.activeSkills[`${skill.model_value}_target_level`]"
                                                    :min="1" :max="10" @change="validateSkillLevel(skill, 'target')" />
                                                <button @click="updateSkillLevel(skill, 'target', -1)">-</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Passive Skills (WW) -->
                        <div class="skills-section">
                            <div class="skills-container">
                                <div v-for="(tier, tierIndex) in passiveSkills" :key="tierIndex" class="skill-tier">
                                    <h4 @click="toggleTier(tierIndex)" class="collapsible-header">
                                        {{ tier.label }}
                                        <span>{{ expandedTiers.includes(tierIndex) ? '-' : '+' }}</span>
                                    </h4>
                                    <div v-if="expandedTiers.includes(tierIndex)" class="skill-collapsible-content">
                                        <div v-for="(skill, skillIndex) in tier.data" :key="skillIndex"
                                            class="skill-card">
                                            <h4>{{ skill.label }}</h4>
                                            <div class="checkbox-control">
                                                <label>Activate</label>
                                                <input type="checkbox"
                                                    v-model="settings.passiveSkills[skill.model_value]"
                                                    @change="updateCharacter" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Skills Tab - Endfield -->
                    <div v-if="currentTab === 'Skills' && isEndfield" class="skills-wrapper-endfield">
                        <!-- Combat Skills (4개, Lv 1~9 + Mastery 1~3) -->
                        <div class="skills-section">
                            <h3>Combat Skills</h3>
                            <div class="skills-container">
                                <div v-for="(skill, index) in endfieldSkills" :key="index" class="skill-card-endfield">
                                    <h4>{{ skill.label }}</h4>
                                    <!-- Level 1~9 -->
                                    <div class="level-controls">
                                        <span class="level-label">Level:</span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldSkillLevel(skill, 'current', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.skills[skill.model_value].current_level"
                                                :min="1" :max="skill.maxLevel"
                                                @change="validateEndfieldSkillLevel(skill, 'current')" />
                                            <button @click="updateEndfieldSkillLevel(skill, 'current', 1)">+</button>
                                        </div>
                                        <span class="divider">>></span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldSkillLevel(skill, 'target', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.skills[skill.model_value].target_level"
                                                :min="1" :max="skill.maxLevel"
                                                @change="validateEndfieldSkillLevel(skill, 'target')" />
                                            <button @click="updateEndfieldSkillLevel(skill, 'target', 1)">+</button>
                                        </div>
                                    </div>
                                    <!-- Mastery 1~3 -->
                                    <div v-if="skill.hasMastery" class="level-controls mastery-controls">
                                        <span class="level-label">Mastery:</span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldMastery(skill, 'current', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.skills[skill.model_value].current_mastery"
                                                :min="0" :max="skill.maxMasteryLevel"
                                                @change="validateEndfieldMastery(skill, 'current')" />
                                            <button @click="updateEndfieldMastery(skill, 'current', 1)">+</button>
                                        </div>
                                        <span class="divider">>></span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldMastery(skill, 'target', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.skills[skill.model_value].target_mastery"
                                                :min="0" :max="skill.maxMasteryLevel"
                                                @change="validateEndfieldMastery(skill, 'target')" />
                                            <button @click="updateEndfieldMastery(skill, 'target', 1)">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Talent (2개, 1~2단계) -->
                        <div class="skills-section">
                            <h3>Talent</h3>
                            <div class="skills-container">
                                <div v-for="(skill, index) in endfieldSpecial" :key="index" class="skill-card-endfield">
                                    <h4>{{ skill.label }}</h4>
                                    <div class="level-controls">
                                        <span class="level-label">Level:</span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldSpecialLevel(skill, 'current', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.special[skill.model_value].current_level"
                                                :min="0" :max="skill.maxLevel"
                                                @change="validateEndfieldSpecialLevel(skill, 'current')" />
                                            <button @click="updateEndfieldSpecialLevel(skill, 'current', 1)">+</button>
                                        </div>
                                        <span class="divider">>></span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldSpecialLevel(skill, 'target', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.special[skill.model_value].target_level"
                                                :min="0" :max="skill.maxLevel"
                                                @change="validateEndfieldSpecialLevel(skill, 'target')" />
                                            <button @click="updateEndfieldSpecialLevel(skill, 'target', 1)">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Base Skill (2개, 1~2단계) -->
                        <div class="skills-section">
                            <h3>Base Skill</h3>
                            <div class="skills-container">
                                <div v-for="(skill, index) in endfieldBaseSkill" :key="index" class="skill-card-endfield">
                                    <h4>{{ skill.label }}</h4>
                                    <div class="level-controls">
                                        <span class="level-label">Level:</span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldBaseSkillLevel(skill, 'current', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.baseSkill[skill.model_value].current_level"
                                                :min="0" :max="skill.maxLevel"
                                                @change="validateEndfieldBaseSkillLevel(skill, 'current')" />
                                            <button @click="updateEndfieldBaseSkillLevel(skill, 'current', 1)">+</button>
                                        </div>
                                        <span class="divider">>></span>
                                        <div class="control-buttons">
                                            <button @click="updateEndfieldBaseSkillLevel(skill, 'target', -1)">-</button>
                                            <input type="number"
                                                v-model="settings.baseSkill[skill.model_value].target_level"
                                                :min="0" :max="skill.maxLevel"
                                                @change="validateEndfieldBaseSkillLevel(skill, 'target')" />
                                            <button @click="updateEndfieldBaseSkillLevel(skill, 'target', 1)">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Attribute Increase (4개, 언락만) -->
                        <div class="skills-section">
                            <h3>Attribute Increase</h3>
                            <div class="skills-container attributes-grid">
                                <div v-for="(attr, index) in endfieldAttributes" :key="index" class="skill-card-endfield attribute-card">
                                    <h4>{{ attr.label }}</h4>
                                    <div class="checkbox-control">
                                        <label>Unlock</label>
                                        <input type="checkbox"
                                            v-model="settings.attributes[attr.model_value]"
                                            @change="updateCharacter" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { setGradientStyle } from '../../services/utils';
import { useLocale } from '@/composables/useLocale';
import { useGameStore } from '@/store/game';

const { tUI, tCharacter } = useLocale();
const gameStore = useGameStore();

const props = defineProps({
    visible: Boolean,
    character: Object,
    settings: Object,
    levelItems: Array,
    // WW props
    activeSkills: Array,
    passiveSkills: Object,
});

// 게임 판별
const isWW = computed(() => gameStore.currentGameId === 'wutheringwave');
const isEndfield = computed(() => gameStore.currentGameId === 'endfield');

// Endfield form fields from config
const endfieldSkills = computed(() => gameStore.formFields?.characterSkills || []);
const endfieldSpecial = computed(() => gameStore.formFields?.characterSpecial || []);
const endfieldBaseSkill = computed(() => gameStore.formFields?.characterBaseSkill || []);
const endfieldAttributes = computed(() => gameStore.formFields?.characterAttributes || []);

const tabs = ['Level', 'Skills'];
const currentTab = ref('Level');
const expandedTiers = ref([]);

const emit = defineEmits(['close', 'updateCharacter']);

const closeDialog = () => {
    emit('close');
};

const updateCharacter = () => {
    emit('updateCharacter');
};

// ========== WW Functions ==========
const toggleTier = (tierIndex) => {
    if (expandedTiers.value.includes(tierIndex)) {
        expandedTiers.value = expandedTiers.value.filter((index) => index !== tierIndex);
    } else {
        expandedTiers.value.push(tierIndex);
    }
};

const updateSkillLevel = (skill, type, delta) => {
    const currentKey = `${skill.model_value}_current_level`;
    const targetKey = `${skill.model_value}_target_level`;

    if (type === 'current') {
        const newValue = props.settings.activeSkills[currentKey] + delta;
        if (newValue >= 1 && newValue <= 10) {
            props.settings.activeSkills[currentKey] = newValue;
            if (newValue > props.settings.activeSkills[targetKey]) {
                props.settings.activeSkills[targetKey] = newValue;
            }
        }
    }

    if (type === 'target') {
        const newValue = props.settings.activeSkills[targetKey] + delta;
        if (newValue >= 1 && newValue <= 10) {
            props.settings.activeSkills[targetKey] = newValue;
            if (newValue < props.settings.activeSkills[currentKey]) {
                props.settings.activeSkills[currentKey] = newValue;
            }
        }
    }

    updateCharacter();
};

const validateSkillLevel = (skill, type) => {
    const currentKey = `${skill.model_value}_current_level`;
    const targetKey = `${skill.model_value}_target_level`;
    const targetLevel = props.settings.activeSkills[targetKey];
    const currentLevel = props.settings.activeSkills[currentKey];

    if (type === 'current') {
        if (props.settings.activeSkills[currentKey] < 1) {
            props.settings.activeSkills[currentKey] = 1;
        } else if (props.settings.activeSkills[currentKey] > 10) {
            props.settings.activeSkills[currentKey] = 10;
        }
        if (props.settings.activeSkills[currentKey] > targetLevel) {
            props.settings.activeSkills[targetKey] = props.settings.activeSkills[currentKey];
        }
    }

    if (type === 'target') {
        if (props.settings.activeSkills[targetKey] < 1) {
            props.settings.activeSkills[targetKey] = 1;
        } else if (props.settings.activeSkills[targetKey] > 10) {
            props.settings.activeSkills[targetKey] = 10;
        }
        if (props.settings.activeSkills[targetKey] < currentLevel) {
            props.settings.activeSkills[targetKey] = currentLevel;
        }
    }

    updateCharacter();
};

// ========== Endfield Functions ==========

// Combat Skills (Level)
const updateEndfieldSkillLevel = (skill, type, delta) => {
    const skillData = props.settings.skills[skill.model_value];
    const maxLevel = skill.maxLevel;

    if (type === 'current') {
        const newValue = skillData.current_level + delta;
        if (newValue >= 1 && newValue <= maxLevel) {
            skillData.current_level = newValue;
            if (newValue > skillData.target_level) {
                skillData.target_level = newValue;
            }
        }
    } else {
        const newValue = skillData.target_level + delta;
        if (newValue >= 1 && newValue <= maxLevel) {
            skillData.target_level = newValue;
            if (newValue < skillData.current_level) {
                skillData.current_level = newValue;
            }
        }
    }
    updateCharacter();
};

const validateEndfieldSkillLevel = (skill, type) => {
    const skillData = props.settings.skills[skill.model_value];
    const maxLevel = skill.maxLevel;

    if (type === 'current') {
        if (skillData.current_level < 1) skillData.current_level = 1;
        if (skillData.current_level > maxLevel) skillData.current_level = maxLevel;
        if (skillData.current_level > skillData.target_level) {
            skillData.target_level = skillData.current_level;
        }
    } else {
        if (skillData.target_level < 1) skillData.target_level = 1;
        if (skillData.target_level > maxLevel) skillData.target_level = maxLevel;
        if (skillData.target_level < skillData.current_level) {
            skillData.target_level = skillData.current_level;
        }
    }
    updateCharacter();
};

// Combat Skills (Mastery)
const updateEndfieldMastery = (skill, type, delta) => {
    const skillData = props.settings.skills[skill.model_value];
    const maxMastery = skill.maxMasteryLevel;

    if (type === 'current') {
        const newValue = skillData.current_mastery + delta;
        if (newValue >= 0 && newValue <= maxMastery) {
            skillData.current_mastery = newValue;
            if (newValue > skillData.target_mastery) {
                skillData.target_mastery = newValue;
            }
        }
    } else {
        const newValue = skillData.target_mastery + delta;
        if (newValue >= 0 && newValue <= maxMastery) {
            skillData.target_mastery = newValue;
            if (newValue < skillData.current_mastery) {
                skillData.current_mastery = newValue;
            }
        }
    }
    updateCharacter();
};

const validateEndfieldMastery = (skill, type) => {
    const skillData = props.settings.skills[skill.model_value];
    const maxMastery = skill.maxMasteryLevel;

    if (type === 'current') {
        if (skillData.current_mastery < 0) skillData.current_mastery = 0;
        if (skillData.current_mastery > maxMastery) skillData.current_mastery = maxMastery;
        if (skillData.current_mastery > skillData.target_mastery) {
            skillData.target_mastery = skillData.current_mastery;
        }
    } else {
        if (skillData.target_mastery < 0) skillData.target_mastery = 0;
        if (skillData.target_mastery > maxMastery) skillData.target_mastery = maxMastery;
        if (skillData.target_mastery < skillData.current_mastery) {
            skillData.target_mastery = skillData.current_mastery;
        }
    }
    updateCharacter();
};

// Talent (Special)
const updateEndfieldSpecialLevel = (skill, type, delta) => {
    const skillData = props.settings.special[skill.model_value];
    const maxLevel = skill.maxLevel;

    if (type === 'current') {
        const newValue = skillData.current_level + delta;
        if (newValue >= 0 && newValue <= maxLevel) {
            skillData.current_level = newValue;
            if (newValue > skillData.target_level) {
                skillData.target_level = newValue;
            }
        }
    } else {
        const newValue = skillData.target_level + delta;
        if (newValue >= 0 && newValue <= maxLevel) {
            skillData.target_level = newValue;
            if (newValue < skillData.current_level) {
                skillData.current_level = newValue;
            }
        }
    }
    updateCharacter();
};

const validateEndfieldSpecialLevel = (skill, type) => {
    const skillData = props.settings.special[skill.model_value];
    const maxLevel = skill.maxLevel;

    if (type === 'current') {
        if (skillData.current_level < 0) skillData.current_level = 0;
        if (skillData.current_level > maxLevel) skillData.current_level = maxLevel;
        if (skillData.current_level > skillData.target_level) {
            skillData.target_level = skillData.current_level;
        }
    } else {
        if (skillData.target_level < 0) skillData.target_level = 0;
        if (skillData.target_level > maxLevel) skillData.target_level = maxLevel;
        if (skillData.target_level < skillData.current_level) {
            skillData.target_level = skillData.current_level;
        }
    }
    updateCharacter();
};

// Base Skill
const updateEndfieldBaseSkillLevel = (skill, type, delta) => {
    const skillData = props.settings.baseSkill[skill.model_value];
    const maxLevel = skill.maxLevel;

    if (type === 'current') {
        const newValue = skillData.current_level + delta;
        if (newValue >= 0 && newValue <= maxLevel) {
            skillData.current_level = newValue;
            if (newValue > skillData.target_level) {
                skillData.target_level = newValue;
            }
        }
    } else {
        const newValue = skillData.target_level + delta;
        if (newValue >= 0 && newValue <= maxLevel) {
            skillData.target_level = newValue;
            if (newValue < skillData.current_level) {
                skillData.current_level = newValue;
            }
        }
    }
    updateCharacter();
};

const validateEndfieldBaseSkillLevel = (skill, type) => {
    const skillData = props.settings.baseSkill[skill.model_value];
    const maxLevel = skill.maxLevel;

    if (type === 'current') {
        if (skillData.current_level < 0) skillData.current_level = 0;
        if (skillData.current_level > maxLevel) skillData.current_level = maxLevel;
        if (skillData.current_level > skillData.target_level) {
            skillData.target_level = skillData.current_level;
        }
    } else {
        if (skillData.target_level < 0) skillData.target_level = 0;
        if (skillData.target_level > maxLevel) skillData.target_level = maxLevel;
        if (skillData.target_level < skillData.current_level) {
            skillData.target_level = skillData.current_level;
        }
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

.header-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.character-info {
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
    width: 700px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
}

.setting-section {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100% - 100px);
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

/* WW Styles */
.skills-wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.skills-section {
    flex: 1;
    max-width: 100%;
    margin-bottom: 20px;
}

.skills-section h3 {
    margin-bottom: 10px;
    color: #333;
    border-bottom: 2px solid #4a90e2;
    padding-bottom: 5px;
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
    transform: translateY(-8px);
}

.collapsible-header {
    background-color: #e0e0e0;
    padding: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    transform: translateY(-20px);
}

.skill-collapsible-content {
    padding: 0 8px;
    background-color: #f9f9f9;
    border-radius: 2px;
}

.level-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.level-label {
    font-size: 12px;
    font-weight: bold;
    min-width: 50px;
}

.control-buttons {
    display: flex;
    align-items: center;
    gap: 3px;
}

.control-buttons input {
    width: 40px;
    height: 28px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.control-buttons button {
    width: 28px;
    height: 28px;
    background-color: #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 14px;
    transition: background 0.3s;
}

.control-buttons button:hover {
    background-color: #4a90e2;
    color: white;
}

.divider {
    font-size: 14px;
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

.checkbox-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

/* Endfield Styles */
.skills-wrapper-endfield {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.skill-card-endfield {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.skill-card-endfield h4 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 14px;
}

.mastery-controls {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #ccc;
}

.attributes-grid {
    grid-template-columns: repeat(2, 1fr);
}

.attribute-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
}

.attribute-card h4 {
    margin-bottom: 10px;
}
</style>
