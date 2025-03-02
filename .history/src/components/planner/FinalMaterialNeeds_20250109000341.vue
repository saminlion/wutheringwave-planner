<template>
    <div class="final-material-needs">
        <h2>Final Material Needs</h2>

        <!--총 필요 계산 부분-->
        <div class="summary-container">
            <div class="summary-card">
                <h3><i class="fas fa-fire"></i> 총 필요 레진</h3>
                <p>{{ totalValues.totalResin }}</p>
            </div>
            <div class="summary-card">
                <h3><i class="fas fa-clock"></i> 예상 완료 시간</h3>
                <p>{{ totalValues.totalDays }} 일</p>
            </div>
        </div>

        <div class="final-container">
            <div class="category-card" v-for="(category, categoryName) in categorizedMaterials" :key="categoryName">
                <h2 class="category-title">{{ category.name }}</h2>

                <div class="subcategory-list">

                    <div class="subcategory-card" v-for="(subCategory, subCategoryName) in category.subCategories"
                        :key="subCategoryName">

                        <h3 v-if="category.name !== subCategory.name">{{ subCategory.name }}</h3>

                        <div class="estimate-container">
                            <p>예상 런 횟수: {{ esimatedRun(category) }}</p>
                            <p>예상 레진 소모: {{ esimatedResin(category) }}</p>
                            <p v-if="subCategory.name !== 'weeklyboss'">예상 완료 시간: <span class="font-semibold">{{
                                esimatedDate(category) }}일</span></p>
                            <p v-else>예상 완료 시간: <span class="font-semibold">{{ esimatedDate(category) }}주</span></p>
                        </div>

                        <ul class="materials-grid">
                            <!-- player_exp 또는 weapon_exp 처리 -->
                            <template v-if="category.name === 'player_exp' || category.name === 'weapon_exp'">
                                <!-- 필요 정보 표시 -->
                                <span class="material-set" v-if="totalExpNeed(category) > 0">
                                    필요: {{ totalExpNeed(category) }}</span>
                                <li class="material-card" v-for="(expDetails, id) in player_exp_material" :key="id">
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(id)" :src="getMaterialIcon(id)" alt="material icon"
                                            class="material-icon" />

                                        <div class="material-quantity-container">
                                            <!-- 필요 뱃지 -->

                                            <!-- 합성 뱃지 -->
                                            <span class="badge badge-synthesize" v-if="expDetails.synthesize > 0">
                                                합성: {{ expDetails.synthesize }}
                                            </span>
                                            <span class="badge badge-owned">
                                                보유: {{ getMaterialQuantity(id) }}
                                            </span>
                                            <!-- 추가 입력 -->
                                            <input class="material-quantity-input" type="number"
                                                @blur="setMaterialQuantity(id, $event.target.value)" />
                                        </div>
                                    </div>
                                </li>
                            </template>

                            <!-- common이나 forgery 카테고리가 아닌 경우 -->
                            <template v-else-if="category.name !== 'common' && category.name !== 'forgery'">
                                <li class="material-card" v-for="task in subCategory.task" :key="task.id">
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(task.id)" :src="getMaterialIcon(task.id)"
                                            alt="material icon" class="material-icon" />
                                        <div class="material-quantity-container">
                                            <!-- 필요 뱃지 -->
                                            <span class="badge badge-need" v-if="task.need > 0">
                                                필요: {{ task.need }}
                                            </span>
                                            <span class="badge"
                                            :class="{
                                                'badge-owned-green': getMaterialQuantity(task.id) >= task.need,
                                                'badge-owned-red': getMaterialQuantity(task.id) < task.need,
                                            }">
                                                보유: {{ getMaterialQuantity(task.id) }}
                                            </span>
                                            <!-- 추가 입력 -->
                                            <input class="material-quantity-input" type="number"
                                                @blur="setMaterialQuantity(task.id, $event.target.value)" />
                                        </div>
                                    </div>
                                </li>
                            </template>

                            <!-- common이나 forgery 카테고리인 경우 -->
                            <template v-else>
                                <li class="material-card" v-for="task in subCategory.task" :key="task.id">
                                    <div class="material-info">
                                        <img v-if="getMaterialIcon(task.id)" :src="getMaterialIcon(task.id)"
                                            alt="material icon" class="material-icon" />
                                        <div class="material-quantity-container">
                                            <!-- 필요 뱃지 -->
                                            <span class="badge badge-need" v-if="task.need > 0">
                                                필요: {{ task.need }}
                                            </span>
                                            <!-- 합성 뱃지 -->
                                            <span class="badge badge-synthesize" v-if="task.synthesize > 0">
                                                합성: {{ task.synthesize }}
                                            </span>
                                            <span class="badge"
                                            :class="{
                                                'badge-owned-green': (getMaterialQuantity(task.id) + task.synthesize) >= task.need,
                                                'badge-owned-red': (getMaterialQuantity(task.id) + task.synthesize) < task.need,
                                            }">
                                                보유: {{ getMaterialQuantity(task.id) }}
                                            </span>
                                            <!-- 추가 입력 -->
                                            <input class="material-quantity-input" type="number"
                                                @blur="setMaterialQuantity(task.id, $event.target.value)" />
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
} from "@/services/materialHelper";
import { useInventoryStore } from "@/store/inventory";
import { player_exp_material } from "@/data/tieredMaterials"

const inventoryStore = useInventoryStore();

const runCache = ref({}); // 캐싱을 위한 객체
const dateCache = ref({}); // 캐싱을 위한 객체
const resinCache = ref({}); // 캐싱을 위한 객체

const categorizedMaterials = ref({});

const resetCaches = () => {
    runCache.value = {};  // 캐시 초기화
    resinCache.value = {};
    dateCache.value = {};
};

const totalValues = reactive({
    totalResin: 0,
    maxDays: 0,
});

const props = defineProps({
    materials: Object // 전달받은 재료 목록
});

const emit = defineEmits(["updateInventory"]);

watch(
    () => props.materials, // 상위 컴포넌트의 materials 변경 감시
    (newMaterials) => {
        console.log("[Debug] Props materials updated:", newMaterials);
        groupMaterialsByCategoryAndSubCategory(newMaterials); // 데이터 재구성
        updateTotalValues(); // 총합 업데이트
    },
    { deep: true }
);

const getMaterialQuantity = (id) => {
    return inventoryStore.getMaterialQuantity(id) || 0;
};

const setMaterialQuantity = (id, value) => {
    const newQuantity = Math.max(0, parseInt(value, 10) || 0); // 음수를 방지하고 숫자로 변환
    emit("updateInventory", { id, quantity: newQuantity });
};

const totalExpNeed = (category) => {
    console.log(`[Debug] category: ${JSON.stringify(category)}`);

    if (!category.subCategories) return 0;

    let missingTotalExp = 0;

    for (const [subcategoryName, subcategoryData] of Object.entries(category.subCategories)) {
        let missingCalExp = 0, currentTotalExp = 0;

        subcategoryData.task.forEach((task) => {
            console.log(`[Debug] Task Need: ${task.need}`);
            missingCalExp = task.need;

            Object.entries(player_exp_material).forEach(([id, exp]) => {
                console.log(`[Debug] ID: ${id}, QTY: ${inventoryStore.getMaterialQuantity(id)}`);
                currentTotalExp += inventoryStore.getMaterialQuantity(id) * exp;
            });
        });

        missingTotalExp += Math.max(0, missingCalExp - currentTotalExp);
    }

    console.log(`[Debug] Final Missing Total Exp: ${missingTotalExp}`);
    return missingTotalExp;
};

const getMaterialIcon = (materialId) => {

    console.log(`[Debug] Material ID: ${materialId}`);

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

    if (materialId === 'player_exp') {
        return getMaterialFieldById(41601004, 'icon')
    }

    else if (materialId === 'weapon_exp') {
        return getMaterialFieldById(41701004, 'icon')
    }

    else {
        return getMaterialFieldById(materialId, 'icon')
    }

    for (const type of types) {
        const material = findMaterial(type, materialId, null, true);
        if (material) {

            console.log(`[Debug] Material: ${material}`);

            return getMaterialField(material, 'icon');
        }
    }
    return null;
};

// 재료 데이터를 카테고리별 + 서브카테고리별로 그룹화하는 함수
const groupMaterialsByCategoryAndSubCategory = (data) => {

    // 최종 JSON 데이터를 저장할 객체
    const groupedMaterialsMap = {};

    // materials 객체 추출
    const materials = data.materials; // 최상위 materials 내의 materials 키 사용
    console.log("[Debug] Extracted Materials:", JSON.stringify(materials));

    for (const [materialId, details] of Object.entries(materials)) {
        if (materialId === 'processed') {
            continue;
        }
        console.log(`[Debug] Processing materialId: ${materialId}`);
        console.log(`[Debug] Details: ${JSON.stringify(details)}`);

        // 데이터 추출 변수 선언
        let subCategory, category, name, owned, synthesize, need;

        // player_exp 또는 weapon_exp의 특별 처리
        if (materialId === 'player_exp' || materialId === 'weapon_exp') {
            subCategory = materialId;
            category = materialId;
            name = materialId; // 이름 추가
            owned = details.owned || 0;
            synthesize = details.synthesize || 0;
            need = details.need || 0;
        }

        // 일반 재료 처리
        else {
            // 필요한 데이터 추출
            subCategory = getMaterialFieldById(materialId, 'SubCategory');
            category = getMaterialFieldById(materialId, 'Category');
            name = getMaterialFieldById(materialId, 'label'); // 이름 추가
            owned = details.owned || 0;
            synthesize = details.synthesize || 0;
            need = details.need || 0;
        }

        // category 초기화
        if (!groupedMaterialsMap[category]) {
            groupedMaterialsMap[category] = {
                id: category,
                name: category,
                subCategories: {},
            };
        }

        // subcategory 초기화
        if (!groupedMaterialsMap[category].subCategories[subCategory]) {
            groupedMaterialsMap[category].subCategories[subCategory] = {
                id: subCategory,
                name: subCategory,
                task: [],
            };
        }

        // task 데이터 추가
        groupedMaterialsMap[category].subCategories[subCategory].task.push({
            id: materialId,
            name: name,
            need: need,
            owned: owned,
            synthesize: synthesize,
        });
    }

    // 객체를 배열로 변환
    const groupedMaterials = Object.values(groupedMaterialsMap).map((category) => ({
        id: category.id,
        name: category.name,
        subCategories: Object.values(category.subCategories),
    }));

    console.log(`[Debug] Get CategorizedMaterials: ${JSON.stringify(groupedMaterials)}`);

    categorizedMaterials.value = groupedMaterials; // 그룹화된 데이터 저장
};

// 계산 함수 호출 및 값 업데이트
const updateTotalValues = () => {
    const { totalResin, totalDays } = CalculateTotalResinAndDate();
    totalValues.totalResin = totalResin;
    totalValues.totalDays = totalDays;
};

// 카테고리별 드랍률 및 레진 값 계산
const GetRateValueForCategory = (data) => {
    let drops = 0, resin = 0, unobtainable = false, categoryName = "";

    // `categorizedMaterials`는 배열 형태로 저장됨
    categorizedMaterials.value.forEach((material) => {
        // subCategory 매칭 확인
        console.log(`[Debug] Material Value: ${JSON.stringify(material)} / Data Value: ${JSON.stringify(data)}`);
        if (material.name === data.name) {
            switch (material.name) {
                case "player_exp":
                    drops = 76000; resin = 40;
                    break;
                case "weapon_exp":
                    drops = 76000; resin = 40;
                    break;
                case "common":
                    unobtainable = true;
                    break;
                case "ascension":
                    unobtainable = true;
                    break;
                case "credit":
                    drops = 84000; resin = 40;
                    break;
                case "forgery":
                    drops = 51; resin = 40;
                    break;
                case "boss":
                    drops = 4.3; resin = 60;
                    break;
                case "weeklyBoss":
                    drops = 3; resin = 60;
                    break;
                default:
                    unobtainable = true;
            }
            categoryName = material.name;
        }
    });

    console.log(`[Debug] Drops: ${drops} / Resin: ${resin} / CategoryName: ${categoryName}`);

    return { drops, resin, unobtainable, categoryName };
};

const esimatedRun = computed(() => (data) => {
    return CalculateEstimatedRun(data);
});

// 예상 런 계산
const CalculateEstimatedRun = (data) => {
    if (runCache.value[data.subcategory]) return runCache.value[data.subcategory];

    const { drops, unobtainable, categoryName } = GetRateValueForCategory(data);

    let runs = 0;

    console.log(`[Debug] Data: ${JSON.stringify(data)}`);

    // `subCategories`를 순회
    Object.entries(data.subCategories).forEach(([subcategoryName, subcategoryData]) => {
        if (!unobtainable) {

            console.log('category Name: ', categoryName);
            if (categoryName === "forgery" || categoryName === "common") {
                const missing = [0, 0, 0, 0]; // rarity별 누적 필요량을 저장하는 배열

                // 각 task를 순회하면서 레어도별 필요량을 누적
                subcategoryData.task.forEach((task) => {
                    const actualNeed = Math.max(0, task.need - (task.owned + task.synthesize));

                    if (actualNeed > 0 && task.rarity >= 2 && task.rarity <= 5) {
                        missing[task.rarity - 2] += actualNeed; // 레어도 인덱스에 누적
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
                    console.log(`[Debug] Data Check Task: ${task.need}`);

                    missingCalExp = task.need;


                    Object.entries(player_exp_material).forEach(([id, exp]) => {
                        console.log(`[Debug] Data Check id: ${id}`);
                        console.log(`[Debug] Data Check qty: ${inventoryStore.getMaterialQuantity(id)}`);

                        const exp_value = inventoryStore.getMaterialQuantity(id) * exp;

                        currentTotalExp += exp_value;
                    });

                });

                const missingTotalExp = Math.max(0, (missingCalExp - currentTotalExp)); // 부족한 총 경험치 계산

                console.log(`[Debug] Missing Total Exp: ${missingTotalExp} / Missing Cal Exp: ${missingCalExp} / Current Total Exp: ${currentTotalExp}`);

                // Step 3: 필요한 런 수 계산
                if (drops <= 0) {
                    console.error("Invalid drops value:", drops);
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

                console.log(`[Debug] Runs: ${runs}, Current Need: ${currentNeed}, Drops: ${drops}`);
            }
        }

    });

    const calculatedRuns = unobtainable ? "" : Math.ceil(runs);

    runCache[data.subcategory] = calculatedRuns;

    console.log(`[Debug] calculatedRuns: ${calculatedRuns}`);

    return calculatedRuns;
};

const esimatedResin = computed(() => (subCategory) => {
    return CalculateEstimatedResin(subCategory);
});

// 예상 레진 계산
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

// 예상 완료 시간 계산
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

// 전체 레진과 날짜를 계산하는 함수
const CalculateTotalResinAndDate = () => {
    const DAILY_RESIN_LIMIT = 240; // 하루에 최대 사용할 수 있는 레진
    let totalResin = 0;

    // `categorizedMaterials` 배열 순회
    categorizedMaterials.value.forEach((material) => {
        const subCategory = material.subcategory;

        console.log(`[Debug] Get Material Data Before Send: ${JSON.stringify(material)}`);

        // 예상 레진 계산
        const resin = parseInt(CalculateEstimatedResin(material), 10);
        if (!isNaN(resin)) totalResin += resin; // NaN 방지
    });

    // 총 레진을 하루 레진 사용량으로 나누어 완료 일수 계산
    const totalDays = Math.ceil(totalResin / DAILY_RESIN_LIMIT);

    return { totalResin, totalDays };
};


onMounted(() => {
    if (!props.materials || !Object.keys(props.materials).length) {
        console.error("[Error] Materials data is not ready:", props.materials);
        return;
    }

    console.log(`[Debug] Get materials: ${JSON.stringify(props.materials)}`);

    // 카테고리별로 재료 그룹화
    //groupMaterialsByCategoryAndSubCategory(Object.values(props.materials));
    groupMaterialsByCategoryAndSubCategory(props.materials);

    // 총합 계산 실행
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
    /* 카테고리 간격 */
    padding: 16px;
    /* 내부 여백 */
    background-color: #f7f9fc;
    /* 배경색 */
    border-radius: 8px;
    /* 둥근 모서리 */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    /* 그림자 */
}

.category-title {
    font-size: 18px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 12px;
    /* 카테고리 타이틀 아래 간격 */
}

.subcategory-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    /* 카드 간 간격 */
    margin-top: 12px;
}

.subcategory-card {
    flex: 1 1 calc(33.33% - 16px);
    /* 3개의 카드가 한 행에 나열 */
    background-color: #ffffff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    /* 카드 크기 및 균등한 열 배치 */
    gap: 16px;
    /* 카드 간 간격 */
    margin-top: 12px;
    list-style: none;
    padding: 0;
    justify-content: center;
    align-items: start;
    /* 카드의 상단 정렬 */
}

.material-card {
    display: flex;
    flex-shrink: 0;
    /* 카드 크기가 줄어들지 않도록 설정 */
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 12px;
    /* 둥근 모서리 */
    padding: 12px;
    /* 카드 내부 여백 */
    width: auto;
    /* 카드 너비 */
    height: auto;
    /* 카드 높이 자동 조정 */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    /* 그림자 추가 */
}

.material-icon {
    width: 60px;
    /* 아이콘 크기 */
    height: 60px;
    margin-bottom: 8px;
    /* 아이콘과 텍스트 간격 */
}

.material-info {
    text-align: center;
    font-size: 14px;
    color: #333;
    font-weight: bold;
    line-height: 1.5;
    /* 텍스트 간격 */
}

.material-quantity {
    color: #27ae60;
    /* 텍스트 강조 색상 */
    font-size: 16px;
    /* 텍스트 크기 */
    font-weight: bold;
    margin-top: 4px;
    /* 텍스트 간격 */
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
    /* 빨간색 */
    color: white;
}

.badge-synthesize {
    background-color: #f1c40f;
    /* 노란색 */
    color: white;
}

.badge-owned{
    background-color: #e74c3c;
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
    /* 강조 색상 */
    font-weight: bold;
    text-align: center;
    margin-bottom: 8px;
    /* 텍스트 간격 */
    display: block;
    /* 줄바꿈 강제 */
}

.final-container {
    background-color: #ecf0f1;
    /* 배경색 */
    padding: 20px;
    /* 여백 */
    border-radius: 8px;
    /* 둥근 모서리 */
}

.estimate-container p {
    font-size: 14px;
    /* 폰트 크기 */
    color: #7f8c8d;
    /* 텍스트 색상 */
    margin: 4px 0;
    /* 텍스트 간격 */
}
</style>