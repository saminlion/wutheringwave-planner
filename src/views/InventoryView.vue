<template>
  <div class="inventory-page">
    <div class="inventory-header">
      <h1>{{ tUI('inventory.title') }}</h1>
      <div v-if="hasVersions" class="fold-actions">
        <button type="button" class="fold-all" @click="setAllOpen(true)">{{ tUI('inventory.expandAll') }}</button>
        <button type="button" class="fold-all" @click="setAllOpen(false)">{{ tUI('inventory.collapseAll') }}</button>
      </div>
    </div>

    <div class="inventory-container" ref="containerRef" @keydown.tab="moveFocus">
      <div v-for="group in inventoryGroups" :key="group.category" class="category-section">
        <h2 class="category-title">{{ translateCategoryName(group.category) }}</h2>

        <!-- Rows of this category with no version: always shown, once -->
        <div v-for="(materials, subcategory) in group.base" :key="subcategory" class="subcategory-block">
          <div class="subcategory-label">{{ translateCategoryName(subcategory) }}</div>
          <div class="inventory-grid">
            <div
                class="inventory-card"
                v-for="material in materials"
                :key="material.game_id"
                :data-id="material.game_id"
                :title="tMaterial(material.game_id, material.label)"
              >
                <img :src="material.icon" :alt="tMaterial(material.game_id, material.label)" class="material-icon" />
                <div class="material-qty">{{ quantities[material.game_id] || 0 }}</div>
                <input
                  type="number"
                  class="quantity-input"
                  v-model.number="newQuantities[material.game_id]"
                  placeholder="0"
                  min="0"
                  @keyup.enter="setQuantity(material.game_id)"
                  @change="setQuantity(material.game_id)"
                  @focus="$event.target.select()"
                />
              </div>
          </div>
        </div>

        <!-- Version folds: only in categories whose materials carry a version -->
        <div
          v-for="fold in group.versions"
          :key="fold.version"
          class="version-section"
          :class="{ collapsed: !isOpen(group, fold.version) }"
        >
          <button
            type="button"
            class="version-header"
            :aria-expanded="isOpen(group, fold.version)"
            @click="toggleGroup(group, fold.version)"
          >
            <i class="fas fa-chevron-right version-chevron" :class="{ open: isOpen(group, fold.version) }"></i>
            <span class="version-name">{{ versionLabel(fold.version) }}</span>
            <span class="version-count">{{ fold.count }}</span>
          </button>

          <!-- v-if, not v-show: folded inputs leave the DOM, so Tab never lands on a hidden box -->
          <template v-if="isOpen(group, fold.version)">
            <div v-for="(materials, subcategory) in fold.subCategories" :key="subcategory" class="subcategory-block">
              <div class="subcategory-label">{{ translateCategoryName(subcategory) }}</div>
              <div class="inventory-grid">
                <div
                class="inventory-card"
                v-for="material in materials"
                :key="material.game_id"
                :data-id="material.game_id"
                :title="tMaterial(material.game_id, material.label)"
              >
                <img :src="material.icon" :alt="tMaterial(material.game_id, material.label)" class="material-icon" />
                <div class="material-qty">{{ quantities[material.game_id] || 0 }}</div>
                <input
                  type="number"
                  class="quantity-input"
                  v-model.number="newQuantities[material.game_id]"
                  placeholder="0"
                  min="0"
                  @keyup.enter="setQuantity(material.game_id)"
                  @change="setQuantity(material.game_id)"
                  @focus="$event.target.select()"
                />
              </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { toast } from 'vue3-toastify';
import { useInventoryStore } from '../store/inventory.js';
import { useGameStore } from '@/store/game';
import { useLocale } from '@/composables/useLocale';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { groupInventory, foldKey, isOpenByDefault } from '@/services/inventoryGroups';

const { tMaterial, tUI } = useLocale();

const translateCategoryName = (categoryName) => {
  const translated = tUI(`category.${categoryName}`);
  return translated !== `category.${categoryName}` ? translated : categoryName;
};

const inventoryStore = useInventoryStore();
const gameStore = useGameStore();

const inventory = computed(() => inventoryStore.inventory);

const materials = computed(() => {
  const data = gameStore.getData('materials');
  if (!data) return [];
  return Object.values(data).flatMap((category) => Object.values(category));
});

const quantities = ref({});
const newQuantities = ref({});

const containerRef = ref(null);

/* Tab 이동 순서를 화면 읽기 순서(좌→우, 상→하)로 고정한다.
   카테고리 섹션은 화면 폭에 따라 여러 열로 나란히 배치되므로, 이동은 섹션 안에서만
   좌→우로 진행하고 섹션 끝에 도달하면 다음(Shift+Tab이면 이전) 섹션의 첫/마지막 칸으로 넘어간다.
   기본 DOM 순서에 맡기면 재렌더(수량 반영·토스트) 타이밍에 따라 포커스가 흔들려서 직접 제어한다. */
const moveFocus = (event) => {
  const container = containerRef.value;
  const current = event.target;
  if (!container || !current.classList?.contains('quantity-input')) return;

  const section = current.closest('.category-section');
  if (!section) return;

  const inputsIn = (el) => Array.from(el.querySelectorAll('.quantity-input'));
  const step = event.shiftKey ? -1 : 1;

  const siblings = inputsIn(section);
  let next = siblings[siblings.indexOf(current) + step];

  if (!next) {
    // 섹션 경계 — 비어 있는 섹션은 건너뛰고 다음 입력 칸을 찾는다
    const sections = Array.from(container.querySelectorAll('.category-section'));
    for (let i = sections.indexOf(section) + step; i >= 0 && i < sections.length; i += step) {
      const candidates = inputsIn(sections[i]);
      if (candidates.length) {
        next = step > 0 ? candidates[0] : candidates[candidates.length - 1];
        break;
      }
    }
  }

  if (!next) return; // 페이지 처음/끝 — 브라우저 기본 동작(헤더·다음 영역)에 맡긴다

  event.preventDefault();
  next.focus();
  next.select();

  // @change 로 인한 재렌더가 포커스를 놓쳐도 되돌린다
  nextTick(() => {
    if (document.activeElement !== next) {
      next.focus();
      next.select();
    }
  });
};

watch(
  materials,
  (newMaterials) => {
    newMaterials.forEach((material) => {
      if (quantities.value[material.game_id] === undefined) {
        quantities.value[material.game_id] = inventory.value[material.game_id] || 0;
      }
    });
  },
  { immediate: true }
);

watch(
  inventory,
  (newInventory) => {
    materials.value.forEach((material) => {
      quantities.value[material.game_id] = newInventory[material.game_id] || 0;
    });
  },
  { deep: true }
);

onMounted(() => {
  const gameId = gameStore.currentGameId;
  inventoryStore.hydrate(gameId);
  materials.value.forEach((material) => {
    quantities.value[material.game_id] = inventory.value[material.game_id] || 0;
  });
});

const inventoryGroups = computed(() => groupInventory(materials.value));

/** Some category has versioned materials → show the expand/collapse-all buttons. */
const hasVersions = computed(() => inventoryGroups.value.some((g) => g.versions.length));

const versionLabel = (version) => tUI('inventory.version').replace('{version}', version);

/* Fold state per game: { [gameId]: { 'category::version': open } }. A view preference like
   timeline_prefs, so it is a device key and not cloud-synced. A fold the user never toggled
   follows isOpenByDefault (its category's newest version open), so a new patch shows up open. */
const FOLD_KEY = 'inventory_groups';
const foldState = ref(loadFromStorage(FOLD_KEY, null) || {});

const gameFolds = () => foldState.value[gameStore.currentGameId] || {};

const isOpen = (group, version) => {
  const saved = gameFolds()[foldKey(group.category, version)];
  return typeof saved === 'boolean' ? saved : isOpenByDefault(group, version);
};

const saveFolds = (folds) => {
  foldState.value = { ...foldState.value, [gameStore.currentGameId]: folds };
  saveToStorage(FOLD_KEY, foldState.value);
};

const toggleGroup = (group, version) => {
  saveFolds({ ...gameFolds(), [foldKey(group.category, version)]: !isOpen(group, version) });
};

const setAllOpen = (open) => {
  const folds = {};
  inventoryGroups.value.forEach((g) => g.versions.forEach((f) => { folds[foldKey(g.category, f.version)] = open; }));
  saveFolds(folds);
};

const setQuantity = (materialId) => {
  const inputVal = newQuantities.value[materialId];
  if (inputVal === null || inputVal === undefined || inputVal === '') return;

  const newQty = Math.max(0, parseInt(inputVal, 10) || 0);
  const currentQty = inventory.value[materialId] || 0;
  const difference = newQty - currentQty;

  if (difference > 0) {
    inventoryStore.addMaterial(materialId, difference);
  } else if (difference < 0) {
    inventoryStore.removeMaterial(materialId, Math.abs(difference));
  }

  newQuantities.value[materialId] = null;

  if (difference !== 0) {
    toast.success(`Updated: ${newQty}`, {
      position: 'bottom-center',
      autoClose: 1500,
      theme: 'dark',
    });
  }
};
</script>

<style scoped>
.inventory-page {
  padding: 0 16px 32px;
}

.inventory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.fold-actions {
  display: flex;
  gap: 6px;
}

.fold-all {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--border, #ccc);
  border-radius: 6px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text-primary, #333);
  cursor: pointer;
}

.fold-all:hover {
  border-color: var(--accent-color, #4a90e2);
}

.version-section {
  margin-top: 10px;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 8px;
  margin-bottom: 6px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 6px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #333);
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.version-section.collapsed .version-header {
  margin-bottom: 0;
}

.version-header:hover {
  border-color: var(--accent-color, #4a90e2);
}

.version-chevron {
  font-size: 10px;
  color: var(--text-secondary, #666);
  transition: transform 0.15s;
}

.version-chevron.open {
  transform: rotate(90deg);
}

.version-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted, #999);
}

/* 카테고리 섹션을 행 우선(row-major) 그리드로 배치.
   원래 카테고리 순서를 좌→우로 유지해 가시성/전달성을 지키면서(우선순위 ①),
   여러 열로 채워 세로 스크롤도 단축(우선순위 ②). 화면 폭 따라 열 수 자동 조정. */
.inventory-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
  align-items: start; /* 같은 행에서 섹션이 최대 높이로 늘어나지 않게 */
}

.category-section {
  background: var(--bg-surface, #f9f9f9);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 10px;
  padding: 12px 16px;
}

.category-title {
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-secondary, #666);
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.subcategory-block {
  margin-bottom: 10px;
}

.subcategory-block:last-child {
  margin-bottom: 0;
}

.subcategory-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #999);
  margin-bottom: 6px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
}

.inventory-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 8px 6px;
  width: auto;
  cursor: default;
  transition: border-color 0.15s;
}

.inventory-card:hover {
  border-color: var(--accent-color, #4a90e2);
}

.material-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.material-qty {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #333);
  line-height: 1;
}

.quantity-input {
  width: 100%;
  box-sizing: border-box;
  padding: 3px 4px;
  text-align: center;
  font-size: 12px;
  border: 1px solid var(--border, #ccc);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text-primary, #333);
}

.quantity-input:focus {
  outline: none;
  border-color: var(--accent-color, #4a90e2);
}
</style>
