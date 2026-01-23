<template>
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
        <div class="gradient-border" :style="setGradientStyle(weapon, true)">
            <div class="dialog-content">
                <div class="header-section">
                    <div class="weapon-info">
                        <h2>{{ weapon?.display_name || 'Unknown' }}</h2> <!-- 무기기 이름 -->
                        <img :src="weapon?.icon || ''" :alt="weapon?.display_name || 'Unknown'" width="50" />
                        <!-- 무기기 아이콘 -->
                    </div>

                    <button class="close-dialog" @click="closeDialog">{{ tUI('common.close') }}</button> <!-- Close 버튼 -->
                </div>
                <div class="setting-section scrollable">
                        <h3>Level</h3>
                        <div>
                            <label>
                                Current Level:
                                <select v-model="settings.currentLevel" @change="updateweapon">
                                    <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </label>
                            <label>
                                Target Level:
                                <select v-model="settings.targetLevel" @change="updateweapon">
                                    <option v-for="item in levelItems" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </label>
                        </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { setGradientStyle } from '../../services/utils';
import { useLocale } from '@/composables/useLocale';

const { tUI } = useLocale();

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
</style>