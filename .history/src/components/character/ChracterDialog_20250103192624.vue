<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="gradient-border" :style="setGradientStyle(character, true)">
            <div class="dialog-content">
                <h2>Selected Character: {{ character?.display_name || 'Unknown' }}</h2>
                <img :src="character?.icon || ''" :alt="character?.display_name || 'Unknown'" width="100" />
                <p>Weapon: {{ character?.weapon || 'Unknown' }}</p>

                <div class="tabs">
                    <button v-for="tab in tabs" :key="tab" :class="{ active: currentTab === tab }"
                        @click="currentTab = tab">
                        {{ tab }}
                    </button>
                </div>

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
                        <h3>Active Skills</h3>
                        <div class="skills-container">
                            <div v-for="(skill, index) in activeSkills" :key="index" class="skill-card">
                                <h4>{{ skill.label }}</h4>
                                <div class="level-controls">
                                    <button @click="updateSkillLevel(skill, 'current', -1)">-</button>
                                    <input type="number"
                                        v-model="settings.activeSkills[`${skill.model_value}_current_level`]" :min="1"
                                        :max="10" @change="validateSkillLevel(skill, 'current')" />
                                    <button @click="updateSkillLevel(skill, 'current', 1)">+</button>
                                    <span> >> </span>
                                    <button @click="updateSkillLevel(skill, 'target', -1)">-</button>
                                    <input type="number"
                                        v-model="settings.activeSkills[`${skill.model_value}_target_level`]" :min="1"
                                        :max="10" @change="validateSkillLevel(skill, 'target')" />
                                    <button @click="updateSkillLevel(skill, 'target', 1)">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Passive Skills -->
                    <div class="skills-section">
                        <h3>Passive Skills</h3>
                        <div class="skills-container">
                            <div v-for="(tier, tierIndex) in passiveSkills" :key="tierIndex" class="skill-tier">
                                <h4 @click="toggleTier(tierIndex)" class="collapsible-header">
                                    {{ tier.label }}
                                    <span>{{ expandedTiers.includes(tierIndex) ? '-' : '+' }}</span>
                                </h4>
                                <div v-if="expandedTiers.includes(tierIndex)" class="skill-collapsible-content">
                                    <div v-for="(skill, skillIndex) in tier.data" :key="skillIndex" class="skill-card">
                                        <h4>{{ skill.label }}</h4>
                                        <div class="checkbox-control">
                                            <label>Activate</label>
                                            <input type="checkbox" v-model="settings.passiveSkills[skill.model_value]"
                                                @change="updateCharacter" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button @click="closeDialog">Close</button>
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

.gradient-border {
    border-radius: 12px;
    /* 둥근 테두리 */
    padding: 5px;
    /* 내부 간격 */
    background-clip: padding-box;
    position: relative;
}

.dialog-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    padding: 10px;
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
    gap: 10px;
    /* 간격 조정 */

}

.skills-section {
    flex: 1;

}

.skills-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;

}

.skill-card {
    background: #f9f9f9;
    padding: 2px;
    /* 패딩 조정 */
    border-radius: 2px;
    /* 둥글기 조금 더 강조 */
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
    display: flex;
    /* 중앙 정렬 */
    flex-direction: column;
    /* 내용이 세로로 정렬되도록 설정 */
    align-items: center;
    justify-content: center;
    margin-bottom: 1px;
    /* 간격 줄이기 */
}

.skill-card h4 {
    margin-bottom: 2px;
    font-size: 14px;
    font-weight: bold;

}

.collapsible-header {
    cursor: pointer;
    padding: 10px;
    background-color: #e0e0e0;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.skill-collapsible-content {
    padding: 0px 8px;
    /* 위쪽 패딩을 줄임 */
    background-color: #f9f9f9;
    border-radius: 2px;

}

.level-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px;
}

.level-controls button {
    width: 28px;
    height: 28px;
    font-size: 16px;
    border: none;
    background: #e0e0e0;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.3s;

}

.level-controls button:hover {
    background: #4a90e2;
    color: white;
}

.level-controls input {
    width: 40px;
    /* 입력 필드 너비를 줄임 */
    text-align: center;
    font-size: 14px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;

}

.checkbox-control {
    margin-top: 0.245rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.checkbox-control label {
    margin-right: 8px;
}
</style>