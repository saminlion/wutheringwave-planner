<template>
    <div class="final-material-needs">
        <h2>Final Material Needs</h2>

        <!-- Endfield専用: 던전 레벨 선택기 -->
        <div v-if="isEndfield" class="dungeon-level-selector">
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
                                                        <template v-if="category.name === 'player_exp' || category.name === 'weapon_exp'">
                                <li class="material-set" v-if="totalExpNeed(category) > 0">
                                    Need: {{ totalExpNeed(category) }}
                                </li>
                                <li class="material-card" v-for="(expDetails, id) in player_exp_material" :key="id">
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(id)" :src="getMaterialIcon(id)" alt="material icon"
                                            class="material-icon" />

                                        <div class="material-quantity-container">
                                            <span class="badge badge-synthesize" v-if="expDetails.synthesize > 0">
                                                Synthesize: {{ expDetails.synthesize }}
                                            </span>
                                            <span class="badge badge-owned">
                                                Owned: {{ getMaterialQuantity(id) }}
                                            </span>
                                            <input class="material-quantity-input" type="number"
                                                @input="setMaterialQuantity(id, $event.target.value)" />
                                        </div>
                                    </div>
                                </li>
                            </template>

                            <!-- common?대굹 forgery 移댄뀒怨좊━媛 ?꾨땶 寃쎌슦 -->
                            <template v-else-if="category.name !== 'common' && category.name !== 'forgery'">
                                <li class="material-card" v-for="task in subCategory.task" :key="task.id">
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(task.id)" :src="getMaterialIcon(task.id)"
                                            alt="material icon" class="material-icon" />
                                        <div class="material-quantity-container">
                                            <!-- Need badge: 合成含めてowned < needの場合のみ表示 -->
                                            <span class="badge badge-need" v-if="(getMaterialQuantity(task.id) + (task.synthesize || 0)) < task.need">
                                                Need: {{ task.need - getMaterialQuantity(task.id) - (task.synthesize || 0) }}
                                            </span>
                                            <!-- Complete badge: 合成含めてowned >= needの場合 -->
                                            <span class="badge badge-complete" v-else-if="task.need > 0">
                                                ✓ Complete
                                            </span>
                                            <!-- Synthesize badge (if applicable) -->
                                            <span class="badge badge-synthesize" v-if="task.synthesize > 0">
                                                Synthesize: {{ task.synthesize }}
                                            </span>
                                            <span class="badge" :class="{
                                                'badge-owned-green': (getMaterialQuantity(task.id) + (task.synthesize || 0)) >= task.need,
                                                'badge-owned-red': (getMaterialQuantity(task.id) + (task.synthesize || 0)) < task.need,
                                            }">
                                                Owned: {{ getMaterialQuantity(task.id) }}
                                            </span>
                                            <!-- Additional input -->
                                            <input class="material-quantity-input" type="number"
                                                @input="setMaterialQuantity(task.id, $event.target.value)" />
                                        </div>
                                    </div>
                                </li>
                            </template>

                            <!-- For common or forgery categories -->
                            <template v-else>
                                <li class="material-card" v-for="task in subCategory.task" :key="task.id">
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(task.id)" :src="getMaterialIcon(task.id)"
                                            alt="material icon" class="material-icon" />
                                        <div class="material-quantity-container">
                                            <!-- Need badge: 合成後もowned < needの場合のみ表示 -->
                                            <span class="badge badge-need" v-if="(getMaterialQuantity(task.id) + task.synthesize) < task.need">
                                                Need: {{ task.need - getMaterialQuantity(task.id) - task.synthesize }}
                                            </span>
                                            <!-- Complete badge: 合成後owned >= needの場合 -->
                                            <span class="badge badge-complete" v-else-if="task.need > 0">
                                                ✓ Complete
                                            </span>
                                            <!-- Synthesize badge -->
                                            <span class="badge badge-synthesize" v-if="task.synthesize > 0">
                                                Synthesize: {{ task.synthesize }}
                                            </span>
                                            <span class="badge" :class="{
                                                'badge-owned-green': (getMaterialQuantity(task.id) + task.synthesize) >= task.need,
                                                'badge-owned-red': (getMaterialQuantity(task.id) + task.synthesize) < task.need,
                                            }">
                                                Owned: {{ getMaterialQuantity(task.id) }}
                                            </span>
                                            <!-- Additional input -->
                                            <input class="material-quantity-input" type="number"
                                                @input="setMaterialQuantity(task.id, $event.target.value)" />
                                        </div>
                                    </div>
                                </li>
                            </template>
                        </ul>

                    </div><!--subcategory-card End-->
                </div><!--subcategory-list End-->
            </div><!--category-card End-->
        </div><!--final-container End-->
    </div> <!--final-material-needs End-->
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
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

// i18n翻訳関数を取得
const { tUI, tMaterial } = useLocale();

// カテゴリ名の翻訳ヘルパー関数
const translateCategoryName = (categoryName) => {
    const translated = tUI(`category.${categoryName}`);
    // 翻訳キーが見つからない場合は元の名前を返す
    return translated !== `category.${categoryName}` ? translated : categoryName;
};

const inventoryStore = useInventoryStore();
const gameStore = useGameStore();
const userProfileStore = useUserProfileStore();

// Endfield判定
const isEndfield = computed(() => {
    return gameStore.currentGameId === 'endfield';
});

// 선택된 던전 레벨 (userProfileストアから取得、デフォルト: 5)
const selectedDungeonLevel = computed({
    get: () => userProfileStore.dungeonLevels?.forgery_skill ?? 5,
    set: (value) => userProfileStore.setDungeonLevel('forgery_skill', value)
});

// 현재 던전 스태미나 표시용
const currentDungeonStamina = computed(() => {
    if (!isEndfield.value) return 0;
    const config = gameStore.currentGame?.config;
    if (!config?.dungeonData?.proto_skill) return 80;
    return config.dungeonData.proto_skill[selectedDungeonLevel.value]?.stamina || 80;
});

// 던전 레벨 변경 시 캐시 리셋
const onDungeonLevelChange = () => {
    resetCaches();
    updateTotalValues();
};

// Endfield용: 티어별 던전 데이터 취득
const getEndfieldDungeonData = (subCategory, level = selectedDungeonLevel.value) => {
    const config = gameStore.currentGame?.config;
    if (!config?.getDungeonDataBySubCategory) return null;
    return config.getDungeonDataBySubCategory(subCategory, level);
};

// player_exp材料のマッピング（game_id → exp値）を動的に取得
const player_exp_material = computed(() => {
    const materials = gameStore.getData('materials') || {};
    const playerExpCategory = materials.player_exp || {};

    const mapping = {};
    Object.values(playerExpCategory).forEach(material => {
        if (material.game_id && material.value) {
            mapping[material.game_id] = material.value;
        }
    });

    return mapping;
});

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

    // Endfield forgery カテゴリの場合、ティア別に分離して計算
    if (isEndfield.value && category.name === 'forgery') {
        return getEndfieldForgeryEstimates(subCategory);
    }

    return {
        run: esimatedRun.value(data),
        resin: esimatedResin.value(data),
        date: esimatedDate.value(data),
        isTierSeparated: false,
    };
};

// Endfield forgery専用: ティア別Estimated計算
const getEndfieldForgeryEstimates = (subCategory) => {
    const dungeonData = getEndfieldDungeonData(subCategory.id);
    if (!dungeonData) {
        // SubCategory가 없으면 proto_skill 기본값 사용
        const fallbackData = getEndfieldDungeonData('proto_skill');
        if (!fallbackData) {
            return { run: 0, resin: 0, date: 0, isTierSeparated: false };
        }
    }

    const data = dungeonData || getEndfieldDungeonData('proto_skill');
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
    return inventoryStore.getMaterialQuantity(id) || 0;
};

const setMaterialQuantity = (id, value) => {
    const newQuantity = Math.max(0, parseInt(value, 10) || 0); // Ensure positive integer
    emit("updateInventory", { id, quantity: newQuantity });
};

const totalExpNeed = (category) => {
    if (!category.subCategories) return 0;

    let missingTotalExp = 0;

    for (const [subcategoryName, subcategoryData] of Object.entries(category.subCategories)) {
        let missingCalExp = 0, currentTotalExp = 0;

        subcategoryData.task.forEach((task) => {
            missingCalExp = task.need;

            Object.entries(player_exp_material.value).forEach(([id, exp]) => {
                currentTotalExp += inventoryStore.getMaterialQuantity(id) * exp;
            });
        });

        missingTotalExp += Math.max(0, missingCalExp - currentTotalExp);
    }

    return missingTotalExp;
};

const getMaterialIcon = (materialId) => {
    const types = [
        "common",
        "ascension",
        "boss",
        "weeklyBoss",
        "player_exp",
        "weapon_exp",
        "forgery",
        "credit",
    ];

    // player_exp/weapon_expの場合、材料データベースから最高ティアを探す
    if (materialId === 'player_exp' || materialId === 'weapon_exp') {
        const materials = gameStore.getData('materials') || {};
        const expCategory = materials[materialId];
        if (expCategory) {
            // 最高ティア（ティア4）のアイコンを取得
            const highestTierItem = Object.values(expCategory).find(item => item.tier === 4);
            if (highestTierItem) {
                return highestTierItem.icon;
            }
        }
        return null;
    }

    return getMaterialFieldById(materialId, 'icon');

    for (const type of types) {
        const material = findMaterial(type, materialId, null, true);
        if (material) {
            return getMaterialField(material, 'icon');
        }
    }
    return null;
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
        if (materialId === 'player_exp' || materialId === 'weapon_exp') {
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

    // Endfield: 던전 레벨에 따른 동적 farmingRates 적용
    if (isEndfield.value) {
        const config = gameStore.currentGame?.config;
        if (config?.getDungeonRates) {
            farmingRates = config.getDungeonRates(selectedDungeonLevel.value);
        }
    }

    categorizedMaterials.value.forEach((material) => {
        if (material.name === data.name) {
            const rate = farmingRates[material.name];
            if (rate) {
                // Endfield forgery는 tier2 기준으로 drops 설정 (tier별 분리는 getEndfieldForgeryEstimates에서 처리)
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
                    const actualNeed = Math.max(0, task.need - (task.owned + task.synthesize));

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
            else if (categoryName === "player_exp" || categoryName === "weapon_exp") {

                let missingCalExp, currentTotalExp = 0;


                subcategoryData.task.forEach((task) => {

                    missingCalExp = task.need;


                    Object.entries(player_exp_material.value).forEach(([id, exp]) => {

                        const exp_value = inventoryStore.getMaterialQuantity(id) * exp;

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
        logger.error("[Error] Materials data is not ready:", props.materials);
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
</style>






