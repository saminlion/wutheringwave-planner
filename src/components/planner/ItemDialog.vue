<template>
    <div v-if="visible" class="dialog-overlay" @click.self="close">
        <div class="dialog-content">
            <div class="dialog-header">
                <h2>{{ itemName }}</h2>
                <button class="close-btn" @click="close">&times;</button>
            </div>

            <div class="dialog-body">
                <!-- 単一アイテム表示 -->
                <template v-if="!isTiered">
                    <div class="item-row">
                        <img v-if="item.icon" :src="item.icon" class="item-icon" />
                        <div class="item-details">
                            <div class="detail-row">
                                <span class="label">{{ tUI('dialog.required') }}:</span>
                                <span class="value">{{ formatNumber(item.need) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">{{ tUI('dialog.owned') }}:</span>
                                <span class="value">{{ formatNumber(item.owned) }}</span>
                            </div>
                            <div class="detail-row" v-if="item.synthesize > 0">
                                <span class="label">{{ tUI('dialog.synthesis') }}:</span>
                                <span class="value synthesis">+{{ formatNumber(item.synthesize) }}</span>
                            </div>
                            <div class="detail-row need-row">
                                <span class="label">{{ tUI('dialog.need') }}:</span>
                                <span class="value" :class="needClass(item)">
                                    {{ formatNumber(calculateNeed(item)) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Tiered/EXPアイテム表示 (横並び、各アイテム別インベントリ入力) -->
                <template v-else>
                    <div class="tiered-items-horizontal">
                        <div
                            v-for="tierItem in tieredItems"
                            :key="tierItem.id"
                            class="tier-card"
                            :class="{ 'item-complete': isExpItem ? false : isItemComplete(tierItem) }"
                            :title="getTierItemName(tierItem)"
                        >
                            <img v-if="tierItem.icon" :src="tierItem.icon" class="tier-icon" :alt="getTierItemName(tierItem)" />

                            <!-- アイテム名表示（翻訳対応） -->
                            <div class="tier-name">
                                {{ getTierItemName(tierItem) }}
                            </div>
                            <!-- EXPアイテム: EXP値表示 -->
                            <div class="tier-exp" v-if="tierItem.expValue">
                                {{ formatNumber(tierItem.expValue) }} EXP
                            </div>

                            <!-- 通常Tieredのみ: Required/Need表示 -->
                            <template v-if="!tierItem.expValue">
                                <div class="tier-stat">
                                    <span class="stat-label">{{ tUI('dialog.req') }}</span>
                                    <span class="stat-value">{{ formatNumber(tierItem.need) }}</span>
                                </div>
                                <div class="tier-stat" v-if="tierItem.synthesize > 0">
                                    <span class="stat-label">{{ tUI('dialog.syn') }}</span>
                                    <span class="stat-value synthesis">+{{ formatNumber(tierItem.synthesize) }}</span>
                                </div>
                                <div class="tier-stat need-stat">
                                    <span class="stat-label">{{ tUI('dialog.need') }}</span>
                                    <span class="stat-value" :class="needClass(tierItem)">
                                        {{ formatNumber(calculateNeed(tierItem)) }}
                                    </span>
                                </div>
                            </template>

                            <!-- 共通: Owned表示 -->
                            <div class="tier-stat">
                                <span class="stat-label">{{ tUI('dialog.own') }}</span>
                                <span class="stat-value">{{ formatNumber(tierItem.owned) }}</span>
                            </div>

                            <!-- アイテム別インベントリ入力 -->
                            <div class="tier-input-container">
                                <input
                                    type="number"
                                    class="tier-input"
                                    v-model.number="tierInputs[tierItem.id]"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- インベントリ入力 (Tieredアイテムの場合) -->
            <div class="dialog-footer" v-if="isTiered">
                <div class="tiered-footer">
                    <button class="save-all-btn" @click="saveAllTierInputs">{{ tUI('common.save') }}</button>
                </div>
            </div>

            <!-- インベントリ入力 (単一アイテムの場合のみ) -->
            <div class="dialog-footer" v-if="!isTiered">
                <div class="inventory-input">
                    <label>{{ tUI('dialog.update_inventory') }}:</label>
                    <input
                        type="number"
                        v-model.number="inputQuantity"
                        @keyup.enter="updateInventory"
                        :placeholder="tUI('dialog.enter_quantity')"
                    />
                    <button @click="updateInventory">{{ tUI('common.save') }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getMaterialFieldById } from '@/services/materialHelper/dbUtils';
import { useLocale } from '@/composables/useLocale';

// i18n翻訳関数を取得
const { tMaterial, tUI } = useLocale();

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    item: {
        type: Object,
        default: () => ({})
    },
    // Tieredアイテムの場合、同じsubcategoryの全アイテム
    relatedItems: {
        type: Array,
        default: () => []
    },
    // インベントリから取得した保有量取得関数
    getMaterialQuantity: {
        type: Function,
        default: () => 0
    }
});

const emit = defineEmits(['close', 'updateInventory']);

const inputQuantity = ref(null);
const tierInputs = ref({});

// アイテム名取得（翻訳対応）
const itemName = computed(() => {
    // Tiered/EXPの場合はprops.item.nameがSubCategory名なのでそのまま使用
    if (isTiered.value && props.item.name) {
        // SubCategory名をカテゴリ翻訳で試みる
        const translated = tUI(`category.${props.item.name}`);
        return translated !== `category.${props.item.name}` ? translated : props.item.name;
    }
    // 単一アイテムの場合は材料翻訳を使用
    const id = props.item.id;
    const fallbackName = props.item.name || getMaterialFieldById(id, 'label') || id;
    return tMaterial(id, fallbackName);
});

// ティアアイテム名取得（翻訳対応）
const getTierItemName = (tierItem) => {
    const fallbackName = tierItem.name || getMaterialFieldById(tierItem.id, 'label') || tierItem.id;
    return tMaterial(tierItem.id, fallbackName);
};

// 複数アイテム（Tiered/EXP等）かどうか
const isTiered = computed(() => {
    return props.relatedItems && props.relatedItems.length > 1;
});

// EXPアイテムかどうか（expValueフィールドで判定）
const isExpItem = computed(() => {
    return props.relatedItems?.some(item => item.expValue > 0) || false;
});

// アイテムリスト（全てtier/value昇順: 低い方が上）
const tieredItems = computed(() => {
    if (!isTiered.value) return [];
    if (isExpItem.value) {
        // EXPアイテムはvalue昇順（低い方が上）
        return [...props.relatedItems].sort((a, b) => (a.expValue || 0) - (b.expValue || 0));
    }
    // 通常はtier昇順
    return [...props.relatedItems].sort((a, b) => (a.tier || 0) - (b.tier || 0));
});

// 数値フォーマット
const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
};

// 必要量計算 (Required - Owned - Synthesis)
const calculateNeed = (item) => {
    const need = item.need || 0;
    const owned = item.owned || 0;
    const synthesize = item.synthesize || 0;
    return Math.max(0, need - owned - synthesize);
};

// アイテムがComplete状態か
const isItemComplete = (item) => {
    return calculateNeed(item) <= 0 && (item.need || 0) > 0;
};

// Need値に応じたクラス
const needClass = (item) => {
    const needValue = calculateNeed(item);
    if (needValue <= 0) return 'complete';
    return 'incomplete';
};

// ダイアログを閉じる
const close = () => {
    emit('close');
};

// インベントリ更新 (単一アイテム用)
const updateInventory = () => {
    if (props.item.id && inputQuantity.value !== null) {
        const quantity = Math.max(0, parseInt(inputQuantity.value, 10) || 0);
        emit('updateInventory', {
            id: props.item.id,
            quantity: quantity
        });
    }
};

// 全ティアの入力を一括保存
const saveAllTierInputs = () => {
    const inputs = tierInputs.value;
    let hasUpdates = false;

    for (const [itemId, value] of Object.entries(inputs)) {
        if (value !== null && value !== undefined && value !== '') {
            const quantity = Math.max(0, parseInt(value, 10) || 0);
            emit('updateInventory', {
                id: itemId,
                quantity: quantity
            });
            hasUpdates = true;
        }
    }

    // 入力をクリア
    if (hasUpdates) {
        tierInputs.value = {};
    }
};

// propsのitemが変わったらinputQuantityとtierInputsをリセット
watch(() => props.item, () => {
    inputQuantity.value = null;
    tierInputs.value = {};
}, { immediate: true });
</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.dialog-content {
    background: white;
    border-radius: 16px;
    min-width: 416px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 21px 26px;
    border-bottom: 1px solid #eee;
}

.dialog-header h2 {
    margin: 0;
    font-size: 23px;
    color: #2c3e50;
}

.close-btn {
    background: none;
    border: none;
    font-size: 31px;
    cursor: pointer;
    color: #7f8c8d;
    padding: 0;
    line-height: 1;
}

.close-btn:hover {
    color: #e74c3c;
}

.dialog-body {
    padding: 26px;
}

.item-row {
    display: flex;
    gap: 21px;
    padding: 16px;
    border-radius: 10px;
    background: #f8f9fa;
    margin-bottom: 16px;
}

.item-row:last-child {
    margin-bottom: 0;
}

.item-row.item-complete {
    background: #e8f5e9;
    opacity: 0.7;
}

.item-icon {
    width: 83px;
    height: 83px;
    object-fit: contain;
}

.item-details {
    flex: 1;
}

.item-name {
    font-weight: bold;
    margin-bottom: 10px;
    color: #2c3e50;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 18px;
}

.detail-row .label {
    color: #7f8c8d;
}

.detail-row .value {
    font-weight: 600;
    color: #2c3e50;
}

.detail-row .value.synthesis {
    color: #f39c12;
}

.detail-row .value.complete {
    color: #27ae60;
}

.detail-row .value.incomplete {
    color: #e74c3c;
}

.need-row {
    border-top: 1px dashed #ddd;
    margin-top: 5px;
    padding-top: 10px;
}

/* 横並びティアアイテム */
.tiered-items-horizontal {
    display: flex;
    flex-direction: row;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 10px;
}

.tier-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 130px;
    padding: 16px;
    border-radius: 10px;
    background: #f8f9fa;
    text-align: center;
}

.tier-card.item-complete {
    background: #e8f5e9;
    opacity: 0.7;
}

.tier-icon {
    width: 62px;
    height: 62px;
    object-fit: contain;
    margin-bottom: 5px;
}

.tier-name {
    font-weight: bold;
    font-size: 14px;
    color: #2c3e50;
    margin-bottom: 5px;
    line-height: 1.2;
    word-break: keep-all;
}

.tier-exp {
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 8px;
}

.tier-stat {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 14px;
    padding: 3px 0;
}

.tier-stat .stat-label {
    color: #7f8c8d;
}

.tier-stat .stat-value {
    font-weight: 600;
    color: #2c3e50;
}

.tier-stat .stat-value.synthesis {
    color: #f39c12;
}

.tier-stat .stat-value.complete {
    color: #27ae60;
}

.tier-stat .stat-value.incomplete {
    color: #e74c3c;
}

.tier-stat.need-stat {
    border-top: 1px dashed #ddd;
    margin-top: 3px;
    padding-top: 5px;
}

.tier-input-container {
    margin-top: 10px;
}

.tier-input {
    width: 78px;
    padding: 5px 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    text-align: center;
}

.tier-input:focus {
    border-color: #3498db;
    outline: none;
}

.tiered-footer {
    display: flex;
    justify-content: flex-end;
}

.save-all-btn {
    padding: 10px 24px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
}

.save-all-btn:hover {
    background: #2980b9;
}

.dialog-footer {
    padding: 21px 26px;
    border-top: 1px solid #eee;
    background: #f8f9fa;
    border-radius: 0 0 16px 16px;
}

.inventory-input {
    display: flex;
    align-items: center;
    gap: 10px;
}

.inventory-input label {
    font-size: 18px;
    color: #7f8c8d;
}

.inventory-input input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 18px;
}

.inventory-input button {
    padding: 10px 21px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
}

.inventory-input button:hover {
    background: #2980b9;
}

</style>
