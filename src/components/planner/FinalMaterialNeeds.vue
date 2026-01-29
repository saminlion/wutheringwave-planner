<template>
    <div class="final-material-needs">
        <h2>Final Material Needs</h2>

        <!-- ダンジョンレベル選択器 (ゲームConfigで制御) -->
        <div v-if="showDungeonLevelSelector" class="dungeon-level-selector">
            <label for="dungeon-level">Dungeon Level:</label>
            <select id="dungeon-level" v-model="selectedDungeonLevel" @change="onDungeonLevelChange">
                <option v-for="level in 5" :key="level" :value="level">
                    Lv.{{ level }}
                </option>
            </select>
            <span class="dungeon-info">
                (Stamina: {{ currentDungeonStamina }})
            </span>
        </div>

        <!-- Total Material Calculation Section -->
        <div class="summary-container">
            <div class="summary-card">
                <h3><i class="fas fa-fire"></i> Total Required Materials</h3>
                <p>{{ totalValues.totalResin }}</p>
            </div>
            <div class="summary-card">
                <h3><i class="fas fa-clock"></i> Estimated Days Required</h3>
                <p>{{ totalValues.totalDays }} </p>
            </div>
        </div>

        <div class="final-container">
            <div class="category-card" v-for="(category, categoryName) in categorizedMaterials" :key="categoryName">
                <h2 class="category-title">{{ translateCategoryName(category.name) }}</h2>

                <div class="subcategory-list">

                    <div class="subcategory-card" v-for="(subCategory, subCategoryName) in category.subCategories"
                        :key="subCategoryName">

                        <h3 v-if="category.name !== subCategory.name">{{ translateCategoryName(subCategory.name) }}</h3>

                                                <div class="estimate-container" v-if="(estimate = getEstimates(category, subCategory))">
                            <!-- Endfield Forgery: ティア別表示 -->
                            <template v-if="estimate.isTierSeparated">
                                <div class="tier-estimate tier2-estimate" v-if="estimate.tier2.need > 0">
                                    <p class="tier-label">Tier2 ({{ estimate.tier2.need }}개)</p>
                                    <p>Runs: {{ estimate.tier2.runs }} ({{ estimate.tier2.resin }} stamina)</p>
                                </div>
                                <div class="tier-estimate tier3-estimate" v-if="estimate.tier3.need > 0">
                                    <p class="tier-label">Tier3 ({{ estimate.tier3.need }}개)</p>
                                    <p>Runs: {{ estimate.tier3.runs }} ({{ estimate.tier3.resin }} stamina)</p>
                                </div>
                                <div class="tier-total">
                                    <p><strong>Total: {{ estimate.run }} runs, {{ estimate.resin }} stamina</strong></p>
                                    <p>Estimated Days: <span class="font-semibold">{{ estimate.date }}</span></p>
                                </div>
                            </template>
                            <!-- 通常表示 (WW / Endfield non-forgery) -->
                            <template v-else>
                                <p>Estimated Runs: {{ estimate.run }}</p>
                                <p>Estimated Resin: {{ estimate.resin }}</p>
                                <p v-if="subCategory.name !== 'weeklyboss'">
                                    Estimated Time:
                                    <span class="font-semibold">{{ estimate.date }}</span>
                                </p>
                                <p v-else>
                                    Estimated Date:
                                    <span class="font-semibold">{{ estimate.date }}</span>
                                </p>
                                <p v-if="estimate.note" class="estimate-note">{{ estimate.note }}</p>
                            </template>
                        </div>

                        <ul class="materials-grid">
                            <!-- player_exp ?먮뒗 weapon_exp 泥섎━ -->
                                                        <!-- EXPカテゴリ: クリックでダイアログ表示 -->
                            <template v-if="isExpCategory(category.name)">
                                <li
                                    class="material-card clickable"
                                    v-show="totalExpNeed(category) > 0"
                                    @click="openExpDialog(category, subCategory)"
                                >
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(category.name)" :src="getMaterialIcon(category.name)"
                                            alt="material icon" class="material-icon" />
                                        <div class="material-quantity-container">
                                            <!-- 不足EXP量のみ表示 -->
                                            <span class="need-number">
                                                {{ totalExpNeed(category).toLocaleString() }}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            </template>

                            <!-- common?대굹 forgery 移댄뀒怨좊━媛 ?꾨땶 寃쎌슦 -->
                            <template v-else-if="category.name !== 'common' && category.name !== 'forgery'">
                                <!-- common/forgery以外: クリックでダイアログ表示、Complete非表示 -->
                                <li
                                    class="material-card clickable"
                                    v-for="task in sortedTasks(subCategory.task)"
                                    :key="task.id"
                                    v-show="!isTaskComplete(task)"
                                    @click="openItemDialog(task, category, subCategory)"
                                >
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(task.id)" :src="getMaterialIcon(task.id)"
                                            alt="material icon" class="material-icon" />
                                        <div class="material-quantity-container">
                                            <!-- 不足量のみ表示 -->
                                            <span class="need-number">
                                                {{ calculateActualNeed(task).toLocaleString() }}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            </template>

                            <!-- common/forgeryカテゴリ: Tiered表示対応 -->
                            <template v-else>
                                <li
                                    class="material-card clickable"
                                    v-for="task in sortedTasks(subCategory.task)"
                                    :key="task.id"
                                    v-show="!isTaskComplete(task)"
                                    @click="openItemDialog(task, category, subCategory)"
                                >
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(task.id)" :src="getMaterialIcon(task.id)"
                                            alt="material icon" class="material-icon" />
                                        <div class="material-quantity-container">
                                            <!-- 不足量のみ表示 -->
                                            <span class="need-number">
                                                {{ calculateActualNeed(task).toLocaleString() }}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            </template>
                        </ul>

                    </div><!--subcategory-card End-->
                </div><!--subcategory-list End-->
            </div><!--category-card End-->
        </div><!--final-container End-->

        <!-- ItemDialog: 詳細表示用ダイアログ -->
        <ItemDialog
            :visible="dialogVisible"
            :item="selectedItem"
            :relatedItems="selectedRelatedItems"
            :getMaterialQuantity="getMaterialQuantity"
            @close="closeDialog"
            @updateInventory="handleDialogUpdateInventory"
        />
    </div> <!--final-material-needs End-->
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { storeToRefs } from 'pinia';
import {
    findMaterial,
    calculatePlayerExp,
    getMaterialField,
    getMaterialFieldById
} from "@/services/materialHelper/index";
import { useInventoryStore } from "@/store/inventory";
import { useGameStore } from "@/store/game";
import { useUserProfileStore } from "@/store/userProfile";
import { useLocale } from '@/composables/useLocale';
import logger from '@/utils/logger';
import ItemDialog from './ItemDialog.vue';

// i18n翻訳関数を取得
const { tUI, tMaterial } = useLocale();

// カテゴリ名の翻訳ヘルパー関数
const translateCategoryName = (categoryName) => {
    const translated = tUI(`category.${categoryName}`);
    // 翻訳キーが見つからない場合は元の名前を返す
    return translated !== `category.${categoryName}` ? translated : categoryName;
};

const inventoryStore = useInventoryStore();
const { inventory } = storeToRefs(inventoryStore);  // Reactive inventory reference
const gameStore = useGameStore();
const userProfileStore = useUserProfileStore();

// ゲームConfig取得
const gameConfig = computed(() => {
    return gameStore.currentGame?.config || {};
});

// UI handler computed properties
const showDungeonLevelSelector = computed(() => {
    return gameConfig.value.uiHandlers?.showDungeonLevelSelector || false;
});

const useDynamicFarmingRates = computed(() => {
    return gameConfig.value.uiHandlers?.useDynamicFarmingRates || false;
});

// 선택된 던전 레벨 (userProfileストアから取得、デフォルト: 5)
const selectedDungeonLevel = computed({
    get: () => userProfileStore.dungeonLevels?.forgery_skill ?? 5,
    set: (value) => userProfileStore.setDungeonLevel('forgery_skill', value)
});

// 현재 던전 스태미나 표시용
const currentDungeonStamina = computed(() => {
    if (!showDungeonLevelSelector.value) return 0;
    const config = gameConfig.value;
    if (!config?.dungeonData?.proto_skill) return 80;
    return config.dungeonData.proto_skill[selectedDungeonLevel.value]?.stamina || 80;
});

// 던전 레벨 변경 시 캐시 리셋
const onDungeonLevelChange = () => {
    resetCaches();
    updateTotalValues();
};

// カテゴリ別ダンジョンデータ取得 (configにgetDungeonDataBySubCategoryがある場合)
const getDungeonDataForCategory = (subCategory, level = selectedDungeonLevel.value) => {
    const config = gameConfig.value;
    if (!config?.getDungeonDataBySubCategory) return null;
    return config.getDungeonDataBySubCategory(subCategory, level);
};

// 動的expカテゴリマッピング: materials.jsonでvalueフィールドを持つカテゴリを自動検出
const expCategoryMaterials = computed(() => {
    const materials = gameStore.getData('materials') || {};
    const result = {};

    // 全カテゴリをスキャンしてvalueフィールドを持つものをexp扱い
    Object.entries(materials).forEach(([categoryName, categoryData]) => {
        const firstItem = Object.values(categoryData || {})[0];
        if (firstItem && typeof firstItem.value === 'number') {
            // このカテゴリはexpカテゴリ
            const mapping = {};
            Object.values(categoryData).forEach(material => {
                if (material.game_id && material.value) {
                    mapping[material.game_id] = material.value;
                }
            });
            result[categoryName] = mapping;
        }
    });

    return result;
});

// カテゴリがexpカテゴリかどうかを判定
const isExpCategory = (categoryName) => {
    return categoryName in expCategoryMaterials.value;
};

// カテゴリに応じたexp材料を取得 (動的)
const getExpMaterialForCategory = (categoryName) => {
    return expCategoryMaterials.value[categoryName] || {};
};

// Get stamina config from current game
const getStaminaConfig = () => {
    const currentGame = gameStore.currentGame;
    return currentGame?.config?.stamina || {
        dailyLimit: 240,
        farmingRates: {}
    };
};

const runCache = ref({}); // Cache for runs
const dateCache = ref({}); // Cache for dates
const resinCache = ref({}); // Cache for resin

const categorizedMaterials = ref({});

// ItemDialog用の状態
const dialogVisible = ref(false);
const selectedItem = ref({});
const selectedRelatedItems = ref([]);

// アイテムが完了状態かどうか判定
const isTaskComplete = (task) => {
    const owned = getMaterialQuantity(task.id);
    const synthesize = task.synthesize || 0;
    return (owned + synthesize) >= task.need && task.need > 0;
};

// 実際の不足量を計算
const calculateActualNeed = (task) => {
    const owned = getMaterialQuantity(task.id);
    const synthesize = task.synthesize || 0;
    return Math.max(0, task.need - owned - synthesize);
};

// タスクをtier順にソート
const sortedTasks = (tasks) => {
    return [...tasks].sort((a, b) => (a.tier || 0) - (b.tier || 0));
};

// ItemDialogを開く
const openItemDialog = (task, category, subCategory) => {
    // ティアがあるラインナップかどうか判定
    // 複数の異なるティアがある場合のみ、同じsubcategoryのアイテムを全て表示
    const tiers = subCategory.task.map(t => t.tier).filter(t => t !== undefined && t !== null);
    const uniqueTiers = new Set(tiers);
    const isTieredLineup = tiers.length > 1 && uniqueTiers.size > 1;

    if (isTieredLineup) {
        // ティア付きラインナップ: SubCategory名をタイトルに
        selectedItem.value = {
            ...task,
            name: subCategory.name, // SubCategory名をタイトルに使用
            owned: getMaterialQuantity(task.id),
            icon: getMaterialIcon(task.id),
        };
        // 全ティアを表示
        selectedRelatedItems.value = subCategory.task.map(t => ({
            ...t,
            owned: getMaterialQuantity(t.id),
            icon: getMaterialIcon(t.id),
        }));
    } else {
        // 独立アイテム: 単体で表示
        selectedItem.value = {
            ...task,
            owned: getMaterialQuantity(task.id),
            icon: getMaterialIcon(task.id),
        };
        selectedRelatedItems.value = [];
    }

    dialogVisible.value = true;
};

// EXPカテゴリ用ダイアログを開く
const openExpDialog = (category, subCategory) => {
    const materials = gameStore.getData('materials') || {};
    const expCategory = materials[category.name] || {};

    // EXP材料をリスト化（value昇順でソート: 低い方が上）
    const expItems = Object.values(expCategory)
        .filter(item => item.game_id)
        .sort((a, b) => (a.value || 0) - (b.value || 0))
        .map(item => ({
            id: item.game_id,
            name: item.label || item.game_id,
            need: subCategory.task[0]?.need || 0, // EXPは総量で管理
            owned: getMaterialQuantity(item.game_id),
            icon: item.icon,
            tier: item.tier || 1,
            expValue: item.value || 0,
        }));

    // 最初のアイテムをselectedItemに
    if (expItems.length > 0) {
        selectedItem.value = {
            ...expItems[0],
            name: category.name, // カテゴリ名をタイトルに
        };
        selectedRelatedItems.value = expItems;
    }

    dialogVisible.value = true;
};

// ダイアログを閉じる
const closeDialog = () => {
    dialogVisible.value = false;
    selectedItem.value = {};
    selectedRelatedItems.value = [];
};

// ダイアログからのインベントリ更新
const handleDialogUpdateInventory = (data) => {
    emit("updateInventory", data);
    // 更新後、selectedItemのowned値も更新
    if (selectedItem.value.id === data.id) {
        selectedItem.value.owned = data.quantity;
    }
    // relatedItemsも更新
    selectedRelatedItems.value = selectedRelatedItems.value.map(item => {
        if (item.id === data.id) {
            return { ...item, owned: data.quantity };
        }
        return item;
    });
};

const resetCaches = () => {
    runCache.value = {};  // Clear cache
    resinCache.value = {};
    dateCache.value = {};
};

const getEstimates = (category, subCategory) => {
    const data = {
        name: category.name,
        subcategory: subCategory.id,
        subCategories: {[subCategory.id]: subCategory}
    };

    // config.uiHandlers.useTierSeparatedEstimatesでティア分離表示判定
    const useTierSeparated = gameConfig.value.uiHandlers?.useTierSeparatedEstimates?.(category) || false;
    if (useTierSeparated) {
        return getTierSeparatedForgeryEstimates(subCategory);
    }

    return {
        run: esimatedRun.value(data),
        resin: esimatedResin.value(data),
        date: esimatedDate.value(data),
        isTierSeparated: false,
    };
};

// ティア分離Estimated計算 (configでhasTierChoiceをサポートするゲーム用)
const getTierSeparatedForgeryEstimates = (subCategory) => {
    const dungeonData = getDungeonDataForCategory(subCategory.id);
    if (!dungeonData) {
        // SubCategoryがない場合、proto_skillをフォールバックとして使用
        const fallbackData = getDungeonDataForCategory('proto_skill');
        if (!fallbackData) {
            return { run: 0, resin: 0, date: 0, isTierSeparated: false };
        }
    }

    const data = dungeonData || getDungeonDataForCategory('proto_skill');
    const { stamina, tier2: tier2Drops, tier3: tier3Drops, hasTierChoice } = data;

    // task에서 tier별 필요량 추출
    let tier2Need = 0;
    let tier3Need = 0;

    subCategory.task.forEach((task) => {
        const actualNeed = Math.max(0, task.need - (task.owned || 0) - (task.synthesize || 0));
        if (actualNeed > 0) {
            if (task.tier === 2) {
                tier2Need += actualNeed;
            } else if (task.tier === 3) {
                tier3Need += actualNeed;
            }
        }
    });

    // Lv.3 미만: tier3 선택 불가, tier2만 파밍
    if (!hasTierChoice) {
        const totalRuns = tier2Drops > 0 ? Math.ceil((tier2Need + tier3Need * 3) / tier2Drops) : 0;
        const totalResin = totalRuns * stamina;
        const totalDays = Math.ceil(totalResin / 240);

        return {
            run: totalRuns,
            resin: totalResin,
            date: totalDays,
            isTierSeparated: false,
            note: 'Lv.3+ required for tier selection',
        };
    }

    // Lv.3 이상: tier2와 tier3 분리 계산
    const tier2Runs = tier2Drops > 0 ? Math.ceil(tier2Need / tier2Drops) : 0;
    const tier3Runs = tier3Drops > 0 ? Math.ceil(tier3Need / tier3Drops) : 0;
    const totalRuns = tier2Runs + tier3Runs;
    const tier2Resin = tier2Runs * stamina;
    const tier3Resin = tier3Runs * stamina;
    const totalResin = tier2Resin + tier3Resin;
    const totalDays = Math.ceil(totalResin / 240);

    return {
        run: totalRuns,
        resin: totalResin,
        date: totalDays,
        isTierSeparated: true,
        tier2: {
            need: tier2Need,
            runs: tier2Runs,
            resin: tier2Resin,
            drops: tier2Drops,
        },
        tier3: {
            need: tier3Need,
            runs: tier3Runs,
            resin: tier3Resin,
            drops: tier3Drops,
        },
        stamina: stamina,
    };
};

const totalValues = reactive({
    totalResin: 0,
    maxDays: 0,
});

const props = defineProps({
    materials: Object // ?꾨떖諛쏆? ?щ즺 紐⑸줉
});

const emit = defineEmits(["updateInventory"]);

watch(
    () => props.materials,
    (newMaterials) => {
        groupMaterialsByCategoryAndSubCategory(newMaterials);
        updateTotalValues();
    },
    { deep: true }
);

const getMaterialQuantity = (id) => {
    // 숫자/문자열 키 불일치 문제 해결: 둘 다 시도
    const stringKey = String(id);
    const qty = inventory.value[id] ?? inventory.value[stringKey] ?? 0;
    return qty;
};

const setMaterialQuantity = (id, value) => {
    const newQuantity = Math.max(0, parseInt(value, 10) || 0); // Ensure positive integer
    emit("updateInventory", { id, quantity: newQuantity });
};

const totalExpNeed = (category) => {
    if (!category.subCategories) return 0;

    // カテゴリに応じたexp材料を取得
    const expMaterial = getExpMaterialForCategory(category.name);
    let missingTotalExp = 0;

    for (const [subcategoryName, subcategoryData] of Object.entries(category.subCategories)) {
        let missingCalExp = 0, currentTotalExp = 0;

        subcategoryData.task.forEach((task) => {
            missingCalExp = task.need;

            Object.entries(expMaterial).forEach(([id, exp]) => {
                currentTotalExp += (inventory.value[id] || 0) * exp;
            });
        });

        missingTotalExp += Math.max(0, missingCalExp - currentTotalExp);
    }

    return missingTotalExp;
};

// カテゴリの全体必要EXP量を取得 (インベントリに関係なく)
const getTotalExpRequired = (category) => {
    if (!category.subCategories) return 0;

    let totalRequired = 0;
    for (const [subcategoryName, subcategoryData] of Object.entries(category.subCategories)) {
        subcategoryData.task.forEach((task) => {
            totalRequired += task.need || 0;
        });
    }
    return totalRequired;
};

const getMaterialIcon = (materialId) => {
    // 動的expカテゴリの場合、材料データベースから最高ティアを探す
    if (isExpCategory(materialId)) {
        const materials = gameStore.getData('materials') || {};
        const expCategory = materials[materialId];
        if (expCategory) {
            // 最高ティアのアイコンを取得 (value降順で最初のもの)
            const items = Object.values(expCategory).filter(item => item.icon);
            const highestItem = items.reduce((max, item) =>
                (item.value || 0) > (max?.value || 0) ? item : max, null);
            if (highestItem) {
                return highestItem.icon;
            }
        }
        return null;
    }

    return getMaterialFieldById(materialId, 'icon');
};

// Group material data by category and subcategory
const groupMaterialsByCategoryAndSubCategory = (data) => {

    // 理쒖쥌 JSON ?곗씠?곕? ??ν븷 媛앹껜
    const groupedMaterialsMap = {};

        // Extract materials object
    const materials = data?.materials || data || {};

    for (const [materialId, details] of Object.entries(materials)) {
        if (materialId === 'processed') {
            continue;
        }
        logger.debug('Details:', details);

        // Data extraction protection
        let subCategory, category, name, owned, synthesize, need;

        // player_exp ?먮뒗 weapon_exp???밸퀎 泥섎━
        if (isExpCategory(materialId)) {
            subCategory = materialId;
            category = materialId;
                        name = materialId; // Name additional
            owned = details.owned || 0;
            synthesize = details.synthesize || 0;
            need = details.need || 0;
        }

        // ?쇰컲 ?щ즺 泥섎━
        else {
                        // Extract required data
            subCategory = getMaterialFieldById(materialId, 'SubCategory');
            category = getMaterialFieldById(materialId, 'Category');
                        name = getMaterialFieldById(materialId, "label"); // Name additional
            owned = details.owned || 0;
            synthesize = details.synthesize || 0;
            need = details.need || 0;
        }

                // Initialize category
        if (!groupedMaterialsMap[category]) {
            groupedMaterialsMap[category] = {
                id: category,
                name: category,
                subCategories: {},
            };
        }

                // Initialize subcategory
        if (!groupedMaterialsMap[category].subCategories[subCategory]) {
            groupedMaterialsMap[category].subCategories[subCategory] = {
                id: subCategory,
                name: subCategory,
                task: [],
            };
        }

                // Add task data
        // tierフィールド取得 (common/forgeryのEstimated計算用)
        const tier = getMaterialFieldById(materialId, 'tier');

        groupedMaterialsMap[category].subCategories[subCategory].task.push({
            id: materialId,
            name: name,
            need: need,
            owned: owned,
            synthesize: synthesize,
            tier: tier,  // common/forgery用のtier情報
        });
    }

    // 媛앹껜瑜?諛곗뿴濡?蹂??
    const groupedMaterials = Object.values(groupedMaterialsMap).map((category) => ({
        id: category.id,
        name: category.name,
        subCategories: Object.values(category.subCategories),
    }));

    categorizedMaterials.value = groupedMaterials;
};

// Execute calculation function and update values
const updateTotalValues = () => {
    const { totalResin, totalDays } = CalculateTotalResinAndDate();
    totalValues.totalResin = totalResin;
    totalValues.totalDays = totalDays;
};

// Calculate drops and stamina values per category (game-agnostic)
const GetRateValueForCategory = (data) => {
    let drops = 0, resin = 0, unobtainable = false, categoryName = "";
    const staminaConfig = getStaminaConfig();
    let farmingRates = staminaConfig.farmingRates || {};

    // 動的farmingRates対応ゲームの場合、ダンジョンレベルに応じたレートを取得
    if (useDynamicFarmingRates.value) {
        const config = gameConfig.value;
        if (config?.getDungeonRates) {
            farmingRates = config.getDungeonRates(selectedDungeonLevel.value);
        }
    }

    categorizedMaterials.value.forEach((material) => {
        if (material.name === data.name) {
            const rate = farmingRates[material.name];
            if (rate) {
                // tier2ベースでdrops設定 (tier分離はgetTierSeparatedForgeryEstimatesで処理)
                drops = rate.drops || rate.tier2 || 0;
                resin = rate.stamina || 0;
                unobtainable = rate.unobtainable || false;
            } else {
                unobtainable = true;
            }
            categoryName = material.name;
        }
    });


    return { drops, resin, unobtainable, categoryName };
};

const esimatedRun = computed(() => (data) => {
    return CalculateEstimatedRun(data);
});

// Calculate runs
const CalculateEstimatedRun = (data) => {
    if (runCache.value[data.subcategory]) return runCache.value[data.subcategory];

    const { drops, unobtainable, categoryName } = GetRateValueForCategory(data);

    let runs = 0;


        // Iterate subCategories
    Object.entries(data.subCategories).forEach(([subcategoryName, subcategoryData]) => {
        if (!unobtainable) {

            if (categoryName === "forgery" || categoryName === "common") {
                const missing = [0, 0, 0, 0]; // rarity蹂??꾩쟻 ?꾩슂?됱쓣 ??ν븯??諛곗뿴

                // 媛?task瑜??쒗쉶?섎㈃???덉뼱?꾨퀎 ?꾩슂?됱쓣 ?꾩쟻
                subcategoryData.task.forEach((task) => {
                    const actualNeed = Math.max(0, task.need - (task.owned + (task.synthesize || 0)));

                    if (actualNeed > 0 && task.tier >= 2 && task.tier <= 5) {
                        missing[task.tier - 2] += actualNeed; // ?덉뼱???몃뜳?ㅼ뿉 ?꾩쟻
                    }
                });

                const missingTotal = missing.reduce(
                    (p, c, i) => p + c * Math.pow(3, i),
                    0
                );

                runs = missingTotal / drops;
            }
            else if (isExpCategory(categoryName)) {
                // 動的expカテゴリ処理
                let missingCalExp, currentTotalExp = 0;
                // カテゴリに応じたexp材料を取得
                const expMaterial = getExpMaterialForCategory(categoryName);

                subcategoryData.task.forEach((task) => {

                    missingCalExp = task.need;

                    Object.entries(expMaterial).forEach(([id, exp]) => {

                        const exp_value = (inventory.value[id] || 0) * exp;

                        currentTotalExp += exp_value;
                    });

                });

                const missingTotalExp = Math.max(0, (missingCalExp - currentTotalExp)); // 遺議깊븳 珥?寃쏀뿕移?怨꾩궛


                // Step 3: ?꾩슂??????怨꾩궛
                if (drops <= 0) {
                    logger.error("Invalid drops value:", drops);
                    runs = 0;
                } else {
                    runs = Math.ceil(missingTotalExp / drops);
                }
            }

            else {
                let currentNeed = 0;

                for (let i = 0; i < subcategoryData.task.length; i++) {
                    const task = subcategoryData.task[i];

                    const acutalNeed = task.need - task.owned;

                    if (acutalNeed > 0) {
                        currentNeed += acutalNeed;
                    }
                }

                runs = Math.ceil(currentNeed / drops);

            }
        }

    });

    const calculatedRuns = unobtainable ? "" : Math.ceil(runs);

    runCache[data.subcategory] = calculatedRuns;


    return calculatedRuns;
};

const esimatedResin = computed(() => (subCategory) => {
    return CalculateEstimatedResin(subCategory);
});

// Calculate resin
const CalculateEstimatedResin = (data) => {
    if (resinCache.value[data.subcategory]) return resinCache.value[data.subcategory];

    const { resin, unobtainable } = GetRateValueForCategory(data);
    if (unobtainable) return "0";

    const totalResin = CalculateEstimatedRun(data) * resin;
    resinCache.value[data.subcategory] = totalResin || "0";

    return resinCache.value[data.subcategory];
};

const esimatedDate = computed(() => (subCategory) => {
    return CalculateEstimatedDate(subCategory);
});

// Estimated Days Required 怨꾩궛
const CalculateEstimatedDate = (data) => {
    if (dateCache.value[data.subcategory]) return dateCache.value[data.subcategory];

    const { resin, unobtainable } = GetRateValueForCategory(data);
    if (unobtainable) return "0";

    const runs = CalculateEstimatedRun(data);
    const date = data.subcategory === "weeklyboss"
        ? Math.ceil(runs / 3)
        : Math.ceil((runs * resin) / 240);

    dateCache.value[data.subcategory] = date;
    return date;
};

// Calculate total
const CalculateTotalResinAndDate = () => {
    const staminaConfig = getStaminaConfig();
    const dailyLimit = staminaConfig.dailyLimit || 240;
    let totalResin = 0;

        // Iterate categorizedMaterials
    categorizedMaterials.value.forEach((category) => {
        category.subCategories.forEach((subCategory) => {

            // Calculate resin
            const resin = parseInt(CalculateEstimatedResin({
                name: category.name,
                subcategory: subCategory.id,
                subCategories: { [subCategory.id]: subCategory }
            }), 10);

                        if (!isNaN(resin)) totalResin += resin; // Prevent NaN
        });
    });

        // Calculate days from total resin
    const totalDays = Math.ceil(totalResin / dailyLimit);

    return { totalResin, totalDays };
};


onMounted(() => {
    // ユーザープロファイル (던전 레벨設定) をロード
    userProfileStore.hydrate();

    if (!props.materials || !Object.keys(props.materials).length) {
        // 初期ロード時はmaterialsが空の場合がある（watchで後から処理される）
        logger.debug("Materials data not ready yet, waiting for watch to update");
        return;
    }

    // Group by category
    //groupMaterialsByCategoryAndSubCategory(Object.values(props.materials));
    groupMaterialsByCategoryAndSubCategory(props.materials);

        // Execute totals
    updateTotalValues(props.materials);
});

</script>

<style scoped>
.summary-container {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
}

.summary-card {
    background-color: #f0f8ff;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
    font-size: 16px;
    margin-bottom: 8px;
    color: #2c3e50;
}

.summary-card p {
    font-size: 24px;
    font-weight: bold;
    color: #34495e;
}

.category-card {
    margin-bottom: 24px;
    /* 移댄뀒怨좊━ 媛꾧꺽 */
    padding: 16px;
    /* ?대? ?щ갚 */
    background-color: #f7f9fc;
    /* 諛곌꼍??*/
    border-radius: 8px;
    /* ?κ렐 紐⑥꽌由?*/
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    /* 洹몃┝??*/
}

.category-title {
    font-size: 18px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 12px;
    /* 移댄뀒怨좊━ ??댄? ?꾨옒 媛꾧꺽 */
}

.subcategory-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    /* 移대뱶 媛?媛꾧꺽 */
    margin-top: 12px;
}

.subcategory-card {
    flex: 1 1 calc(33.33% - 16px);
    /* 3媛쒖쓽 移대뱶媛 ???됱뿉 ?섏뿴 */
    background-color: #ffffff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    /* 移대뱶 ?ш린 諛?洹좊벑????諛곗튂 */
    gap: 16px;
    /* 移대뱶 媛?媛꾧꺽 */
    margin-top: 12px;
    list-style: none;
    padding: 0;
    justify-content: center;
    align-items: start;
    /* 移대뱶???곷떒 ?뺣젹 */
}

.material-card {
    display: flex;
    flex-shrink: 0;
    /* 移대뱶 ?ш린媛 以꾩뼱?ㅼ? ?딅룄濡??ㅼ젙 */
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 12px;
    /* ?κ렐 紐⑥꽌由?*/
    padding: 12px;
    /* 移대뱶 ?대? ?щ갚 */
    width: auto;
    /* 移대뱶 ?덈퉬 */
    height: auto;
    /* 移대뱶 ?믪씠 ?먮룞 議곗젙 */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    /* 洹몃┝??Additional */
}

.material-icon {
    width: 60px;
    /* ?꾩씠肄??ш린 */
    height: 60px;
    margin-bottom: 8px;
    /* ?꾩씠肄섍낵 ?띿뒪??媛꾧꺽 */
}

.material-info {
    text-align: center;
    font-size: 14px;
    color: #333;
    font-weight: bold;
    line-height: 1.5;
    /* ?띿뒪??媛꾧꺽 */
}

.material-quantity {
    color: #27ae60;
    /* ?띿뒪??媛뺤“ ?됱긽 */
    font-size: 16px;
    /* ?띿뒪???ш린 */
    font-weight: bold;
    margin-top: 4px;
    /* ?띿뒪??媛꾧꺽 */
}

.badge {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 8px;
    margin: 2px;
    text-align: center;
}

.badge-need {
    background-color: #e74c3c;
    /* 鍮④컙??*/
    color: white;
}

.badge-synthesize {
    background-color: #f1c40f;
    /* ?몃???*/
    color: white;
}

.badge-owned {
    background-color: #27ae60;
    color: white;
}

.badge-complete {
    background-color: #27ae60;
    color: white;
}

.badge-owned-green {
    background-color: #27ae60;
    /* 珥덈줉??*/
    color: white;
}

.badge-owned-red {
    background-color: #e74c3c;
    /* 鍮④컙??*/
    color: white;
}

.material-quantity-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 8px;
}

.material-quantity-input {
    width: 60px;
    padding: 4px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 4px;
}

.material-set {
    font-size: 14px;
    color: #e74c3c;
    /* 媛뺤“ ?됱긽 */
    font-weight: bold;
    text-align: center;
    margin-bottom: 8px;
    /* ?띿뒪??媛꾧꺽 */
    display: block;
    /* 以꾨컮轅?媛뺤젣 */
}

.final-container {
    background-color: #ecf0f1;
    /* 諛곌꼍??*/
    padding: 20px;
    /* ?щ갚 */
    border-radius: 8px;
    /* ?κ렐 紐⑥꽌由?*/
}

.estimate-container p {
    font-size: 14px;
    /* ?고듃 ?ш린 */
    color: #7f8c8d;
    /* ?띿뒪???됱긽 */
    margin: 4px 0;
    /* ?띿뒪??媛꾧꺽 */
}

/* 던전 레벨 선택기 스타일 */
.dungeon-level-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: #e8f4f8;
    border-radius: 8px;
    border: 1px solid #b8d4e3;
}

.dungeon-level-selector label {
    font-weight: bold;
    color: #2c3e50;
}

.dungeon-level-selector select {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #3498db;
    background-color: white;
    font-size: 14px;
    cursor: pointer;
}

.dungeon-level-selector select:hover {
    border-color: #2980b9;
}

.dungeon-level-selector .dungeon-info {
    color: #7f8c8d;
    font-size: 13px;
}

/* 티어별 Estimate 스타일 */
.tier-estimate {
    padding: 8px;
    margin: 4px 0;
    border-radius: 6px;
    background-color: #f8f9fa;
}

.tier2-estimate {
    border-left: 3px solid #3498db;
}

.tier3-estimate {
    border-left: 3px solid #9b59b6;
}

.tier-label {
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 2px;
}

.tier-total {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #bdc3c7;
}

.tier-total p {
    color: #2c3e50;
}

.estimate-note {
    font-size: 12px;
    color: #e67e22;
    font-style: italic;
    margin-top: 4px;
}

/* クリック可能なカードスタイル */
.material-card.clickable {
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.material-card.clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.material-card.clickable:active {
    transform: translateY(0);
}

/* 不足量表示用スタイル */
.need-number {
    font-size: 18px;
    font-weight: bold;
    color: #e74c3c;
}
</style>






