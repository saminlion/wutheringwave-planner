<template>
    <div class="final-material-needs">
        <h2>Final Material Needs</h2>
        <ul class="materials-grid">
            <li class="material-card" v-for="(qty, mat) in materials" :key="mat">
                <img v-if="getMaterialIcon(mat)" :src="getMaterialIcon(mat)" alt="material icon"
                    class="material-icon" />
                <div class="material-info">
                    <span class="material-quantity">{{ qty > 0 ? qty : 0 }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
    findMaterial,
    getMaterialField
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
const groupMaterialsByCategoryAndSubCategory = (materials) => {
    const grouped = materials.reduce((acc, material) => {
        const category = material.category || 'Uncategorized'; // 카테고리 없으면 'Uncategorized'
        const subCategory = material.subcategory || 'Misc'; // 서브카테고리 없으면 'Misc'

        // 카테고리 초기화
        if (!acc[category]) {
            acc[category] = {
                name: category,
                subCategories: {},
            };
        }

        // 서브카테고리 초기화
        if (!acc[category].subCategories[subCategory]) {
            acc[category].subCategories[subCategory] = {
                name: subCategory,
                tasks: [], // 빈 배열로 초기화
            };
        }

        // keyPart 값 추출 (문자열 분할)
        const keyPart = material.key
            ? material.key.split('_').slice(0, -2).join('_')
            : 'unknown_key';

        // 새로운 객체를 깊은 복사하여 배열에 추가
        const newItem = JSON.parse(JSON.stringify({
            ...material,   // 기존 재료 데이터 복사
            key: keyPart,  // 변경된 key 사용
        }));

        acc[category].subCategories[subCategory].tasks.push(newItem);

        return acc;
    }, {});

    categorizedMaterials.value = grouped; // 그룹화된 데이터 저장
};

// 계산 함수 호출 및 값 업데이트
const updateTotalValues = () => {
    const { totalResin, totalDays } = CalculateTotalResinAndDate();
    totalValues.totalResin = totalResin;
    totalValues.totalDays = totalDays;
};

// 카테고리별 드랍률 및 레진 값 계산
const GetRateValueForCategory = (subCategory) => {
    let drops = 0, resin = 0, unobtainable = false, categoryName = "";

    Object.values(categorizedMaterials.value).forEach((category) => {
        Object.values(category.subCategories).forEach((subCat) => {
            if (subCat.name === subCategory.name) {
                switch (category.name) {
                    case "resonator_exp_material":
                        drops = 76000; resin = 40;
                        break;
                    case "weapon_exp_material":
                        drops = 76000; resin = 40;
                        break;
                    case "enemy_drop_weapon_skill_material":
                    case "overworld_resource_ascension_material":
                        unobtainable = true;
                        break;
                    case "credit":
                        drops = 84000; resin = 40;
                        break;
                    case "forgery_weapon_skill_material":
                        drops = 51; resin = 40;
                        break;
                    case "boss_ascension_material":
                        drops = 4.3; resin = 60;
                        break;
                    case "weekly_boss_skill_upgrade_material":
                        drops = 3; resin = 60;
                        break;
                    default:
                        unobtainable = true;
                }
                categoryName = category.name;
            }
        });
    });

    return { drops, resin, unobtainable, categoryName };
};

const esimatedRun = computed(() => (subCategory) => {
    return CalculateEstimatedRun(subCategory);
});

// 예상 런 계산
const CalculateEstimatedRun = (subCategory) => {
    if (runCache.value[subCategory.name]) return runCache.value[subCategory.name];

    const { drops, unobtainable, categoryName } = GetRateValueForCategory(subCategory);

    let runs = 0;

    if (!unobtainable) {

        console.log('category Name: ', categoryName);
        if (categoryName === "forgery_weapon_skill_material" || categoryName === "enemy_drop_weapon_skill_material") {
            const missing = [0, 0, 0, 0]; // rarity별 누적 필요량을 저장하는 배열

            // 각 task를 순회하면서 레어도별 필요량을 누적
            for (let i = 0; i < subCategory.tasks.length; i++) {
                const task = subCategory.tasks[i];

                const acutalNeed = task.needed - (task.owned + task.synthesized);

                if (acutalNeed > 0) {

                    if (task.rarity >= 2 && task.rarity <= 5) {
                        // 해당 레어도 인덱스에 누적 필요량을 더함
                        missing[task.rarity - 2] += acutalNeed;
                    }
                }
            }

            const missingTotal = missing.reduce(
                (p, c, i) => p + c * Math.pow(3, i),
                0
            );

            runs = missingTotal / drops;
        }
        else if (categoryName === "resonator_exp_material" || categoryName === "weapon_exp_material") {

            const expValueMapping = {
                basic: 1000,
                medium: 3000,
                advanced: 8000,
                Premium: 20000
            };

            // Step 1: exp_value를 동적으로 추가
            subCategory.tasks.forEach(task => {
                for (const key in expValueMapping) {
                    if (task.key.toLowerCase().includes(key.toLowerCase())) {
                        task.exp_value = expValueMapping[key];
                        break;
                    }
                    else {
                        console.warn(`No matching exp_value found for task.key: ${task.key}`);
                    }
                }
                task.exp_value = task.exp_value || 0; // 기본값 설정
            });

            // Step 2: 부족한 총 경험치 계산
            let missingCalExp = 0;
            let currentTotalExp = 0;

            subCategory.tasks.forEach(task => {
                const acutalNeed = Math.max(0, (task.needed || 0) - (task.owned || 0));
                missingCalExp += acutalNeed * task.exp_value;
                currentTotalExp += (task.owned || 0) * task.exp_value;
            });

            const missingTotalExp = Math.max(0, missingCalExp - currentTotalExp); // 부족 경험치 계산

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
            for (let i = 0; i < subCategory.tasks.length; i++) {
                const task = subCategory.tasks[i];

                const acutalNeed = task.needed - task.owned;

                // console.log('task:', task);

                if (acutalNeed > 0) {
                    currentNeed += acutalNeed;
                }
            }

            runs = Math.ceil(currentNeed / drops);
        }
    }

    const calculatedRuns = unobtainable ? "" : Math.ceil(runs);

    runCache[subCategory.name] = calculatedRuns;

    return calculatedRuns;
};

const esimatedResin = computed(() => (subCategory) => {
    return CalculateEstimatedResin(subCategory);
});

// 예상 레진 계산
const CalculateEstimatedResin = (subCategory) => {
    if (resinCache.value[subCategory.name]) return resinCache.value[subCategory.name];

    const { resin, unobtainable } = GetRateValueForCategory(subCategory);
    if (unobtainable) return "0";

    const totalResin = CalculateEstimatedRun(subCategory) * resin;
    resinCache.value[subCategory.name] = totalResin || "0";

    return resinCache.value[subCategory.name];
};

const esimatedDate = computed(() => (subCategory) => {
    return CalculateEstimatedDate(subCategory);
});

// 예상 완료 시간 계산
const CalculateEstimatedDate = (subCategory) => {
    if (dateCache.value[subCategory.name]) return dateCache.value[subCategory.name];

    const { resin, unobtainable } = GetRateValueForCategory(subCategory);
    if (unobtainable) return "0";

    const runs = CalculateEstimatedRun(subCategory);
    const date = subCategory.name === "weeklyboss"
        ? Math.ceil(runs / 3)
        : Math.ceil((runs * resin) / 240);

    dateCache.value[subCategory.name] = date;
    return date;
};

// 전체 레진과 날짜를 계산하는 함수
const CalculateTotalResinAndDate = () => {
    const DAILY_RESIN_LIMIT = 240; // 하루에 최대 사용할 수 있는 레진

    let totalResin = 0;

    // 모든 카테고리와 서브카테고리를 순회하며 레진 합산
    Object.values(categorizedMaterials.value).forEach((category) => {
        Object.values(category.subCategories).forEach((subCategory) => {
            const resin = parseInt(CalculateEstimatedResin(subCategory), 10);
            if (!isNaN(resin)) totalResin += resin;
        });
    });

    // 총 레진을 하루에 사용할 수 있는 레진으로 나눠 최종 완료 일수 계산
    const totalDays = Math.ceil(totalResin / DAILY_RESIN_LIMIT);

    return { totalResin, totalDays };
};


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