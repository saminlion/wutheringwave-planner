<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="gradient-border" :style="setGradientStyle(character, true)">
            <div class="dialog-content">
                <div class="header-section">
                    <div class="character-info">
                        <h2>{{ character?.display_name || 'Unknown' }}</h2> <!-- 캐릭터 이름 -->
                        <img :src="character?.icon || ''" :alt="character?.display_name || 'Unknown'" width="50" />
                        <!-- 캐릭터 아이콘 -->
                    </div>

                    <button class="close-dialog" @click="closeDialog">Close</button> <!-- Close 버튼 -->
                </div>
                <div class="tabs">
                    <button v-for="tab in tabs" :key="tab" :class="{ active: currentTab === tab }"
                        @click="currentTab = tab">
                        {{ tab }}
                    </button>
                </div>

                <div class="setting-section scrollable">
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
                    <div v-if="currentTab === 'Skills'" class="skills-wrapper">
                        <!-- Active Skills -->
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

                        <!-- Passive Skills -->
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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { setGradientStyle } from '../../services/utils';

const props = defineProps({
    visible: Boolean,
    character: Object,
    settings: Object,
    levelItems: Array,
    activeSkills: Array,
    passiveSkills: Object,
});

const tabs = ['Level', 'Skills'];
const currentTab = ref('Level');
const expandedTiers = ref([]); // 열려있는 Tier의 인덱스를 저장

const emit = defineEmits(['close', 'updateCharacter']);

const closeDialog = () => {
    emit('close');
};

const updateCharacter = () => {
    emit('updateCharacter');
};

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

    const currentLevel = props.settings.activeSkills[currentKey];
    const targetLevel = props.settings.activeSkills[targetKey];

    if (type === 'current') {
        const newValue = props.settings.activeSkills[currentKey] + delta;

        if (newValue >= 1 && newValue <= 10) {
            props.settings.activeSkills[currentKey] = newValue;
            // `current`가 `target`보다 크다면 `target`도 업데이트
            if (newValue > props.settings.activeSkills[targetKey]) {
                props.settings.activeSkills[targetKey] = newValue;
            }
        }
    }

    if (type === 'target') {
        // `target` 값 업데이트
        const newValue = props.settings.activeSkills[targetKey] + delta;
        if (newValue >= 1 && newValue <= 10) {
            props.settings.activeSkills[targetKey] = newValue;
            // `target`이 `current`보다 작다면 `current`도 업데이트
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

    const currentLevel = props.settings.activeSkills[currentKey];
    const targetLevel = props.settings.activeSkills[targetKey];

    if (type === 'current') {
        if (props.settings.activeSkills[currentKey] < 1) {
            props.settings.activeSkills[currentKey] = 1; // 최소값
        } else if (props.settings.activeSkills[currentKey] > 10) {
            props.settings.activeSkills[currentKey] = 10; // 최대값
        }
        // Current가 Target보다 크면 Target을 Current로 맞춤
        if (props.settings.activeSkills[currentKey] > targetLevel) {
            props.settings.activeSkills[targetKey] = props.settings.activeSkills[currentKey];
        }
    }

    if (type === 'target') {
        if (props.settings.activeSkills[targetKey] < 1) {
            props.settings.activeSkills[targetKey] = 1; // 최소값
        } else if (props.settings.activeSkills[targetKey] > 10) {
            props.settings.activeSkills[targetKey] = 10; // 최대값
        }
        // Target이 Current보다 작으면 Target을 Current로 맞춤
        if (props.settings.activeSkills[targetKey] < currentLevel) {
            props.settings.activeSkills[targetKey] = currentLevel;
        }
    }

    updateCharacter();
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
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 8px;
    text-align: center;
}

.collapsible-header {
    background-color: #e0e0e0;
    padding: 10px;
    margin-bottom: 10px;
    cursor: pointer;
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
</style>