<template>
    <div class="final-material-needs">
        <h2>Final Material Needs</h2>

        <!--총 필요 계산 부분-->
        <div class="summary-container">
            <h1>총 필요 레진 및 예상 완료 시간</h1>
            <p class="total-resin"> 총 필요 레진: {{ totalValues.totalResin }}</p>
            <p class="total-time"> 예상 필요 시간: {{ totalValues.totalDays }} 일</p>
        </div>

        <div class="final-container">
            <div class="category-container" v-for="(category, categoryName) in categorizedMaterials"
                :key="categoryName">
                {{ category.name }}

                <div class="subcategory-container" v-for="(subCategory, subCategoryName) in category.subCategories"
                    :key="subCategoryName">

                    <h3 v-if="category.name !== subCategory.name">{{ subCategory.name }}</h3>

                    <div class="estimate-container">
                        <p>예상 런 횟수: {{ esimatedRun(subCategory) }}</p>
                        <p>예상 레진 소모: {{ esimatedResin(subCategory) }}</p>
                    </div>

                    <ul class="materials-grid">

                        <li class="material-card" v-for="(qty, mat) in materials" :key="mat">
                            <img v-if="getMaterialIcon(mat)" :src="getMaterialIcon(mat)" alt="material icon"
                                class="material-icon" />
                            <div class="material-info">
                                <span class="material-quantity">{{ qty > 0 ? qty : 0 }}</span>
                            </div>
                        </li>
                    </ul>
                </div><!--subcategory-container End-->
            </div><!--category-container End-->
        </div><!--final-container End-->
    </div> <!--final-material-needs End-->
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import {
    findMaterial,
    getMaterialField,
    getMaterialFieldById
} from "@/services/materialHelper";

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
    for (const type of types) {
        const material = findMaterial(type, materialId, null, true);
        if (material) {
            return getMaterialField(material, "icon");
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
        console.log(`[Debug] Processing materialId: ${materialId}`);
        console.log(`[Debug] Details: ${JSON.stringify(details)}`);

        // 필요한 데이터 추출
        const subCategory = getMaterialFieldById(materialId, 'SubCategory');
        const category = getMaterialFieldById(materialId, 'Category');
        const name = getMaterialFieldById(materialId, 'label'); // 이름 추가
        const owned = details.owned || 0;
        const synthesize = details.synthesize || 0;
        const need = details.need || 0;


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
            categoryName = material.category;
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

    if (!unobtainable) {

        console.log('category Name: ', categoryName);
        if (categoryName === "forgery_weapon_skill_material" || categoryName === "enemy_drop_weapon_skill_material") {
            const missing = [0, 0, 0, 0]; // rarity별 누적 필요량을 저장하는 배열

            // 각 task를 순회하면서 레어도별 필요량을 누적
            data.task.forEach((task) => {
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
        // else if (categoryName === "player_exp" || categoryName === "weapon_exp") {

        //     const expValueMapping = {
        //         basic: 1000,
        //         medium: 3000,
        //         advanced: 8000,
        //         Premium: 20000
        //     };

        //     // Step 1: exp_value를 동적으로 추가
        //     data.tasks.forEach(task => {
        //         for (const key in expValueMapping) {
        //             if (task.key.toLowerCase().includes(key.toLowerCase())) {
        //                 task.exp_value = expValueMapping[key];
        //                 break;
        //             }
        //             else {
        //                 console.warn(`No matching exp_value found for task.key: ${task.key}`);
        //             }
        //         }
        //         task.exp_value = task.exp_value || 0; // 기본값 설정
        //     });

        //     // Step 2: 부족한 총 경험치 계산
        //     let missingCalExp = 0;
        //     let currentTotalExp = 0;

        //     data.tasks.forEach(task => {
        //         const acutalNeed = Math.max(0, (task.needed || 0) - (task.owned || 0));
        //         missingCalExp += acutalNeed * task.exp_value;
        //         currentTotalExp += (task.owned || 0) * task.exp_value;
        //     });

        //     const missingTotalExp = Math.max(0, missingCalExp - currentTotalExp); // 부족 경험치 계산

        //     // Step 3: 필요한 런 수 계산
        //     if (drops <= 0) {
        //         console.error("Invalid drops value:", drops);
        //         runs = 0;
        //     } else {
        //         runs = Math.ceil(missingTotalExp / drops);
        //     }
        // }

        else {
            let currentNeed = 0;

            for (let i = 0; i < data.task.length; i++) {
                const task = data.task[i];

                const acutalNeed = task.need - task.owned;

                if (acutalNeed > 0) {
                    currentNeed += acutalNeed;
                }
            }

            runs = Math.ceil(currentNeed / drops);

            console.log(`[Debug] Runs: ${runs}, Current Need: ${currentNeed}, Drops: ${drops}`);
        }
    }

    const calculatedRuns = unobtainable ? "" : Math.ceil(runs);

    runCache[data.subcategory] = calculatedRuns;

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

    console.log(`[Debug] Get materials: ${JSON.stringify(props.materials)}`);

    // 카테고리별로 재료 그룹화
    //groupMaterialsByCategoryAndSubCategory(Object.values(props.materials));
    groupMaterialsByCategoryAndSubCategory(props.materials);

    // 총합 계산 실행
    //updateTotalValues(props.materials);
});

</script>

<style scoped>
.materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 8px;
    margin-top: 12px;
    list-style: none;
    padding: 0;
}

.material-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.material-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
}

.material-info {
    text-align: center;
    font-size: 12px;
    color: #333;
    font-weight: bold;
}

.material-quantity {
    color: black;
    padding: 2px 6px;
    font-size: 12px;
}
</style>