# Future TODO List

This document tracks planned features and improvements for the Wuthering Waves Planner, organized by priority.

Last Updated: 2026-01-26

---

## ✅ Recently Completed

### 1. Complete Goal Feature Enhancement
**Status:** ✅ COMPLETED (2026-01-22)
**File:** `src/views/PlannerView.vue`

**Implemented Features:**
1. ✅ **Material Availability Check**
   - Validates materials before goal completion
   - Considers both direct inventory and potential synthesis (3:1 ratio)
   - Shows detailed error message if materials are insufficient

2. ✅ **Auto-Synthesis Implementation**
   - Automatically synthesizes high-tier materials from low-tier materials
   - Uses 3:1 synthesis ratio
   - Applies synthesis chain (Tier 1 → Tier 2 → Tier 3 → Tier 4)
   - Shows synthesis info in confirmation dialog

3. ✅ **Protection Logic**
   - Blocks goal completion if materials cannot be satisfied
   - Shows clear error message: "Insufficient materials: Need X more of [Material Name]"

4. ✅ **Player EXP Handling**
   - Fixed player_exp validation bug
   - Properly deducts from individual potion items (41601001-41601004)
   - Uses largest potions first for efficiency

5. ✅ **Korean Text Encoding Fix**
   - Fixed all garbled Korean text in PlannerView.vue
   - Fixed all garbled Korean text in FinalMaterialNeeds.vue
   - Replaced with English comments and labels

**Key Functions Added:**
- `validateMaterialsWithSynthesis()` - Validates materials and plans synthesis
- `performSynthesis()` - Executes material synthesis
- Player EXP deduction with potion conversion

---

## 📋 High Priority

### Localization: 캐릭터/재료명 다국어 지원
**Status:** TODO
**Priority:** HIGH
**Last Updated:** 2026-01-26

**현재 문제:**
- 한글 설정 시 UI 텍스트는 번역되지만, 캐릭터 이름/재료 이름은 영어로 표시됨
- `display_name`, `label` 등 데이터 필드가 영어 고정

**영향 범위:**
- 캐릭터 목록 (`CharacterView.vue`)
- 무기 목록 (`WeaponView.vue`)
- 재료 표시 (`FinalMaterialNeeds.vue`, `InventoryView.vue`)
- 목표 카드 (`PlannerView.vue`)

**해결 방안:**

**Option 1: 데이터 파일 내 다국어 필드**
```json
{
  "game_id": 1234,
  "display_name": "Rover",
  "display_name_ko": "로버",
  "display_name_ja": "ローバー"
}
```
- 장점: 단순한 구조
- 단점: 데이터 파일 크기 증가

**Option 2: 별도 번역 파일 (권장)**
```
src/locales/
  ko/
    characters.json  ← { "1234": "로버" }
    materials.json   ← { "41101001": "LF 위스퍼링 코어" }
  en/
    characters.json
    materials.json
```
- 장점: 데이터/번역 분리, 언어 추가 용이
- 단점: 매핑 관리 필요

**작업 체크리스트:**
- [ ] 번역 파일 구조 결정 (Option 1 vs 2)
- [ ] 캐릭터명 번역 파일 생성 (WW, Endfield)
- [ ] 재료명 번역 파일 생성 (WW, Endfield)
- [ ] `useLocale` composable에 `tCharacter(id)`, `tMaterial(id)` 추가
- [ ] 각 View에서 번역 함수 적용
- [ ] 게임별 번역 파일 로딩 처리

---

### 2. Apply Phase 1 Improvements to Existing Code
**Status:** Lower Priority (User Requested)
**Priority:** Moved to Low Priority
**Reference:** `LocalOnly/PHASE1_IMPLEMENTATION_GUIDE.md`

**Tasks (Lower Priority):**
- [x] Replace all `console.log` with `logger.debug` throughout codebase
- [x] Replace all `console.warn` with `logger.warn`
- [x] Replace all `console.error` with `logger.error`
- [ ] Add `LoadingSpinner` to views with async operations (if needed)
- [ ] Wrap async operations with `useLoading` composable (if needed)
- [ ] Replace direct localStorage calls with storage utilities
- [ ] Add error boundaries to critical operations

**Note:** User requested to deprioritize LoadingSpinner and console.log replacement.

---

## 🎯 Medium Priority

### 3. Multi-Game Refactoring
**Status:** ✅ Phase 1 COMPLETED (2026-01-22)
**Reference:** `LocalOnly/REFACTORING_PLAN.md`, `LocalOnly/MULTI_GAME_ARCHITECTURE.md`

**Completed:**
1. ✅ Game Registry System
   - Created `src/store/gameRegistry.js`
   - Supports multiple game registration
   - Persists game selection in localStorage

2. ✅ Endfield Game Structure
   - Created `src/games/endfield/` directory
   - Confirmed level progression: 1~20 (base), 20~40 (1st asc), 40~60 (2nd asc), 60~80 (3rd asc), 80~90 (4th asc)
   - Confirmed active skills exist, passive skills TBD
   - Recipe-based synthesis system (different from WW's 3:1 tier system)

3. ✅ Endfield Data Structure
   - Created all JSON templates: character.json, weapon.json, materials.json, costs.json
   - Created synthesisRecipes.json for recipe-based crafting
   - Set up tiered materials system
   - Created comprehensive Korean documentation: `LocalOnly/Endfield/DATA_STRUCTURE.md`

4. ✅ Game Selector UI
   - Added GameSelector component to header
   - Switch between WW ↔ Endfield
   - Auto-reload on game switch

5. ✅ Endfield Raw Data Input View
   - `/endfield-data` route for JSON input
   - Character, Weapon, Material data entry
   - localStorage persistence

**Key Differences from WW:**
- **Synthesis**: WW uses 3:1 tier upgrade (same material), Endfield uses recipe mixing (e.g., 1:3:1 different materials)
- **Level System**: Same as WW (confirmed)
- **Passive Skills**: Not yet confirmed

**Documentation:**
- `LocalOnly/Endfield/DATA_STRUCTURE.md` - Complete guide for entering Endfield data (Korean)
- `LocalOnly/WutheringWaves/` - Reserved for future WW data documentation

**Next Steps:**
- [ ] Add actual Endfield character/weapon data as it becomes available
- [ ] Implement recipe-based synthesis calculator
- [ ] Create WW data documentation in `LocalOnly/WutheringWaves/`
- [ ] Test with actual Endfield data
- [x] **Refactor stamina/resin calculation to be game-agnostic** (COMPLETED 2026-01-23)
  - **File:** `src/components/planner/FinalMaterialNeeds.vue`
  - **Hardcoded WW values in `GetRateValueForCategory()` (lines 347-377):**
    - Credit: drops=76000, resin=40
    - Player EXP: drops=76000, resin=40
    - Weapon EXP: drops=84000, resin=40
    - Common: drops=51, resin=40
    - Boss: drops=4.3, resin=60
    - WeeklyBoss: drops=3, resin=60
  - **Hardcoded daily limit (line 524):** `DAILY_RESIN_LIMIT = 240`
  - **Solution:** Move to game plugin config (Endfield already has `DAILY_STAMINA: 240` in config.js)
  - Each game has different stamina systems (WW: Waveplates, Endfield: Sanity)
  - Stamina costs per domain/stage vary by game

**Goal:** Transform the Wuthering Waves-specific planner into a multi-game plugin system.

**Phases:**

#### Phase 1: Core Engine Extraction (2 days)
- [x] Extract synthesis logic to `src/core/engine/synthesis.js`
- [x] Extract calculator to `src/core/engine/calculator.js`
- [x] Extract progression logic to `src/core/engine/progression.js`
- [x] Create `src/core/index.js` as entry point

#### Phase 2: WW Plugin Migration (3 days)
- [x] Create `src/games/wutheringwave/` directory structure
- [x] Move WW data to `src/games/wutheringwave/data/`:
  - `character.json`
  - `weapon.json`
  - `materials.json` (renamed from inventoryItem.json)
  - `costs.json`
  - `tiers.js` (renamed from tieredMaterials.js)
- [x] Create `src/games/wutheringwave/config.js`
- [x] Create `src/games/wutheringwave/index.js` plugin entry point

#### Phase 3: Game Registry (2 days)
- [x] Create `src/store/gameRegistry.js` Pinia store
- [x] Update `main.js` to register games
- [x] Update views to use game registry
- [x] Add game selector UI component

#### Phase 4: Testing (1 day)
- [ ] Integration tests for WW plugin
- [ ] Comparison tests vs old system
- [ ] Regression testing

#### Phase 5: Documentation (1 day)
- [ ] Plugin development guide
- [ ] Migration guide
- [ ] Example plugin template

**Estimated Effort:** 9 days (2 weeks)

**Success Criteria:**
- [ ] Core engine is 100% game-agnostic
- [ ] WW data lives in plugin at `src/games/wutheringwave/`
- [ ] Can switch games via registry
- [ ] All tests pass
- [ ] Zero breaking changes for users
- [ ] Adding new game takes < 1 day

---

## 🔮 Future Features

### 4. Endfield 던전 스태미나 계산 기능
**Status:** TODO (내일 할 일)
**Priority:** Medium
**Reference:** `LocalOnly/Endfield/README.md` - 던전 스태미나 및 보상 섹션

**Description:**
필요 재료량을 기반으로 던전 런 횟수 및 스태미나 소모량 계산

**Features:**
- [ ] 필요 재료 → 던전 런 횟수 변환
- [ ] 티어2 vs 티어3 효율 비교 및 추천
- [ ] 총 스태미나 소모량 계산
- [ ] 일일 스태미나(240) 기준 예상 일수 표시

**던전 데이터 (README에서 확정):**
| 던전 | 스태미나 범위 | 비고 |
|------|--------------|------|
| Proto (돌파) | 40-80 | Lv.3+ 티어 선택 |
| Proto (스킬) | 40-80 | Lv.3+ 티어 선택 |
| Cast Die (무기) | 40-80 | Lv.3+ 티어 선택 |
| 캐릭터 EXP | 40-80 | Combat Record / Cognitive Carrier 선택 |
| 무기 EXP | 40-80 | |
| Credit | 40-80 | |

**구현 위치:**
- `src/games/endfield/data/dungeons.json` (신규)
- `src/components/planner/FinalMaterialNeeds.vue` (수정)

**Estimated Effort:** 1-2 days

---

### 5. General Stamina Tracker
**Status:** Planned
**Priority:** Low

**Description:**
Track resin/stamina usage and recovery for farming materials.

**Features:**
- Current stamina counter
- Stamina recovery timer
- Material farming cost calculator (stamina per material)
- Daily stamina budget planner

**UI Location:** New tab or section in PlannerView

**Estimated Effort:** 2-3 days

---

### 6. Notes Module
**Status:** Planned
**Priority:** Low

**Description:**
Allow users to add personal notes to characters, weapons, and goals.

**Features:**
- Rich text notes per character/weapon
- Goal-specific notes
- Note search and filtering
- Export notes with backup

**UI Location:** Expandable section in character/weapon cards

**Estimated Effort:** 2-3 days

---

### 7. Material Farming Routes
**Status:** Idea Phase
**Priority:** Very Low

**Description:**
Suggest optimal farming routes for materials based on goals.

**Features:**
- Daily material domain schedule
- World boss respawn tracking
- Weekly boss checklist
- Farming priority recommendations

**Estimated Effort:** 3-4 days

---

### 8. Team Planner
**Status:** Idea Phase
**Priority:** Very Low

**Description:**
Plan and optimize full team compositions.

**Features:**
- Team slot management
- Resonance/element synergy calculator
- Team-wide material requirements
- Export team builds

**Estimated Effort:** 4-5 days

---

## 📊 Task Order Recommendation

Based on current priorities:

```
1. Complete Goal Feature Enhancement (Critical - blocks user workflow)
   ↓
2. Apply Phase 1 Improvements (High - code quality & UX)
   ↓
3. Multi-Game Refactoring (Medium - architectural foundation)
   ↓
4. Stamina Tracker (Low - nice-to-have feature)
   ↓
5. Notes Module (Low - nice-to-have feature)
   ↓
6. Material Farming Routes (Very Low - optional)
   ↓
7. Team Planner (Very Low - optional)
```

---

## 🔧 Technical Debt

### Material Processing Refactoring (HIGH PRIORITY)
**Status:** TODO
**Priority:** HIGH - 새 게임 추가 시 필수
**Last Updated:** 2026-01-26

---

#### 🚨 현재 문제점

**1. `src/services/materialHelper/core.js` - processMaterials 함수**

현재 WW와 Endfield 키가 모두 하드코딩되어 있음:
```javascript
// WW 전용 키
if (['common', 'forgery'].includes(key)) { ... }
else if (['ascension', 'boss', 'weeklyBoss'].includes(key)) { ... }

// Endfield 전용 키 (임시로 추가됨)
else if (['proto_asc', 'proto_skill', 'cast_die'].includes(key)) { ... }
else if (['bolete', 'odendra', 'onyx'].includes(key)) { ... }
else if (key === 'special') { ... }
```

**문제:** 새 게임 추가할 때마다 이 파일을 수정해야 함. 게임별 로직이 섞여있어 유지보수 어려움.

---

**2. `src/services/materialHelper/character.js` - costs 구조 정규화**

```javascript
const normalizedCosts = Array.isArray(costs) ? costs[0] : costs;
```

**문제:** WW는 배열 `[{...}]`, Endfield는 객체 `{...}` 형태. 임시 처리로 해결했지만 각 게임 플러그인에서 일관된 형태로 제공해야 함.

---

**3. `src/components/planner/FinalMaterialNeeds.vue` - player_exp_material**

```javascript
const player_exp_material = computed(() => {
    const materials = gameStore.getData('materials') || {};
    const playerExpCategory = materials.player_exp || {};
    // ...
});
```

**문제:**
- WW player_exp IDs: `41601001~41601004`
- Endfield player_exp IDs: `5160010023~5160010027`
- 로그에서 `Player EXP Results: {41601004: {...}}` 출력 → WW ID가 하드코딩된 곳 있음

**하드코딩 위치 (확인 필요):**
- `src/views/PlannerView.vue` - completeGoal 함수 내 player_exp 처리
- `src/core/engine/calculator.js` - calculatePlayerExp 관련

---

**4. `src/services/materialHelper/dbUtils.js` - findMaterial 함수**

현재 `gameStore.getData('materials')`를 사용하여 동적으로 검색하지만, 카테고리 구조가 게임마다 다름:

| 카테고리 | WW | Endfield |
|---------|-----|----------|
| 캐릭터 돌파 | `common` (SubCategory로 구분) | `ascension` (bolete, odendra 등) |
| 스킬 재료 | `forgery` (SubCategory로 구분) | `forgery` (proto_asc, proto_skill 등) |
| 보스 재료 | `boss`, `weeklyBoss` | 없음 (현재) |
| 특수 재료 | 없음 | `special` |

---

**5. costs.json 키 매핑 차이**

**WW costs.json 키:**
```
common: [qty, tier]      → character.common SubCategory에서 tier 검색
forgery: [qty, tier]     → character.forgery SubCategory에서 tier 검색
ascension: qty           → character.ascension game_id 직접 참조
boss: qty                → character.boss game_id 직접 참조
weeklyBoss: qty          → character.weeklyBoss game_id 직접 참조
credit: qty              → credit 카테고리에서 검색
```

**Endfield costs.json 키:**
```
proto_asc: [qty, tier]   → forgery 카테고리에서 SubCategory="proto_asc" & tier 검색
proto_skill: [qty, tier] → forgery 카테고리에서 SubCategory="proto_skill" & tier 검색
cast_die: [qty, tier]    → forgery 카테고리에서 SubCategory="cast_die" & tier 검색
bolete: [qty, tier]      → character.bolete game_id → SubCategory 찾기 → ascension에서 tier 검색
odendra: [qty, tier]     → character.odendra game_id → SubCategory 찾기 → ascension에서 tier 검색
onyx: [qty, tier]        → character.onyx game_id → SubCategory 찾기 → ascension에서 tier 검색
special: qty             → character.special game_id 직접 참조
credit: qty              → credit 카테고리에서 검색
perseverance: qty        → 직접 추가 (처리 로직 필요)
```

---

#### ✅ 해결책: 게임별 materialProcessor 분리

**목표 구조:**
```
src/games/
  wutheringwave/
    index.js              ← processMaterials 함수 export
    materialProcessor.js  ← WW 전용 키 처리 로직
    data/
      costs.json
      materials.json
      ...
  endfield/
    index.js              ← processMaterials 함수 export
    materialProcessor.js  ← Endfield 전용 키 처리 로직
    data/
      costs.json
      materials.json
      ...
```

**게임 플러그인 인터페이스:**
```javascript
// src/games/[game]/index.js
export default {
  id: 'game_id',
  name: 'Game Name',
  data: { ... },
  config: { ... },

  // 새로 추가할 메서드
  processMaterials: (materials, key, value, entityInfo) => { ... },
  getExpMaterialMapping: () => { ... },  // player_exp/weapon_exp ID → value 매핑
  getCreditId: () => { ... },            // credit game_id 반환
};
```

**core.js 수정:**
```javascript
export const processMaterials = (materials, key, value, characterInfo) => {
    const gameStore = useGameStore();
    const currentGame = gameStore.currentGame;

    // 게임 플러그인의 processMaterials 호출
    if (currentGame?.processMaterials) {
        return currentGame.processMaterials(materials, key, value, characterInfo);
    }

    // fallback (legacy)
    logger.warn('No game-specific processMaterials found');
};
```

---

#### 📋 작업 체크리스트

**Phase 1: 인터페이스 정의**
- [ ] 게임 플러그인 인터페이스에 `processMaterials` 메서드 스펙 정의
- [ ] 게임 플러그인 인터페이스에 `getExpMaterialMapping` 메서드 추가
- [ ] 게임 플러그인 인터페이스에 `getCreditId` 메서드 추가

**Phase 2: WW 분리**
- [ ] `src/games/wutheringwave/materialProcessor.js` 생성
- [ ] core.js에서 WW 전용 로직 이동:
  - `common`, `forgery` 처리
  - `ascension`, `boss`, `weeklyBoss` 처리
- [ ] `src/games/wutheringwave/index.js`에서 export

**Phase 3: Endfield 분리**
- [ ] `src/games/endfield/materialProcessor.js` 생성
- [ ] core.js에서 Endfield 전용 로직 이동:
  - `proto_asc`, `proto_skill`, `cast_die` 처리
  - `bolete`, `odendra`, `onyx` 처리
  - `special`, `perseverance` 처리
- [ ] `src/games/endfield/index.js`에서 export

**Phase 4: core.js 리팩토링**
- [ ] `processMaterials`를 동적 디스패처로 변경
- [ ] 공통 로직만 유지: `credit`, `player_exp`, `weapon_exp`
- [ ] 게임별 getCreditId() 호출로 변경

**Phase 5: FinalMaterialNeeds.vue 수정**
- [ ] `player_exp_material` computed를 게임 플러그인 메서드 호출로 변경
- [ ] 하드코딩된 WW player_exp ID (41601004 등) 제거
- [ ] `getExpMaterialMapping()` 사용

**Phase 6: PlannerView.vue 수정**
- [ ] completeGoal 함수 내 player_exp 처리 로직 확인
- [ ] 하드코딩된 ID 제거

**Phase 7: 테스트**
- [ ] WW에서 캐릭터 목표 설정 → 재료 계산 확인
- [ ] Endfield에서 캐릭터 목표 설정 → 재료 계산 확인
- [ ] 게임 전환 후 재계산 확인
- [ ] 목표 완료 시 인벤토리 차감 확인

---

#### 📁 영향받는 파일 목록

| 파일 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| `src/services/materialHelper/core.js` | WW+Endfield 혼합 | 동적 디스패처로 변경 |
| `src/services/materialHelper/character.js` | costs 정규화 로직 | 게임 플러그인으로 이동 |
| `src/services/materialHelper/weapon.js` | costs 정규화 로직 | 게임 플러그인으로 이동 |
| `src/components/planner/FinalMaterialNeeds.vue` | player_exp_material 하드코딩 | 게임 플러그인 메서드 사용 |
| `src/views/PlannerView.vue` | completeGoal 내 EXP 처리 | 확인 필요 |
| `src/games/wutheringwave/index.js` | 데이터만 export | processMaterials 추가 |
| `src/games/endfield/index.js` | 데이터만 export | processMaterials 추가 |

---

**Estimated Effort:** 2-3 days (테스트 포함)

---

### Code Quality
- [ ] Add TypeScript type definitions
- [ ] Set up ESLint with strict rules
- [ ] Add Prettier for code formatting
- [ ] Implement unit tests (Vitest)
- [ ] Add E2E tests (Playwright)

### Performance
- [ ] Implement virtual scrolling for large lists
- [ ] Optimize material calculations (memoization)
- [ ] Add service worker for offline support
- [ ] Implement lazy loading for routes

### Accessibility
- [ ] Add ARIA labels to interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast theme option

---

## 📝 Notes

### Material Synthesis Logic Reference
The synthesis engine uses a 3:1 ratio:
- 3 Tier 1 materials → 1 Tier 2 material
- 3 Tier 2 materials → 1 Tier 3 material
- 3 Tier 3 materials → 1 Tier 4 material

**Backward conversion** (surplus):
- 1 Tier 4 → 3 Tier 3 (if Tier 4 is in surplus)
- 1 Tier 3 → 3 Tier 2 (if Tier 3 is in surplus)
- etc.

**Key Files:**
- `src/core/engine/synthesis.js` - Core synthesis logic
- `src/games/wutheringwave/data/tiers.js` - Material tier definitions (WW-specific)

### Game-Specific vs Game-Agnostic
**Already Game-Agnostic (Reusable):**
- Synthesis engine (3:1 ratio)
- Material calculator
- Experience optimizer
- Inventory management

**Still Game-Specific (Now in game plugins):**
- Material category definitions → `src/games/[game]/data/materials.json`
- Character/weapon data structures → `src/games/[game]/data/character.json`, `weapon.json`
- Cost data → `src/games/[game]/data/costs.json`
- Tier definitions → `src/games/[game]/data/tiers.js`

---

## 🎉 Recently Completed

### ✅ Settings Page with Data Backup
- Created DataBackup component with backup/restore/clear functionality
- Added storage usage indicator
- Translated all UI text to English
- Integrated into SettingsView

### ✅ Complete Goal Button
- Added "Complete" button to goal cards
- Implemented completeGoal() function
- Updates character/weapon current levels to target
- Deducts materials from inventory
- Shows confirmation dialog
- **Note:** Still needs auto-synthesis and validation (see #1)

### ✅ Documentation Translation
- Converted all LocalOnly .md files from garbled Korean to English
- Created comprehensive architecture documentation
- Added implementation guides and quick start docs

---

## 🤝 Contributing

When adding new features:
1. Update this TODO list with status changes
2. Document technical decisions in comments
3. Add tests for critical logic
4. Update CLAUDE.md if architecture changes
5. Follow Vue 3 Composition API patterns

---

## 📧 Questions?

Refer to:
- `CLAUDE.md` - Project overview and architecture
- `LocalOnly/PHASE1_IMPLEMENTATION_GUIDE.md` - Phase 1 improvements
- `LocalOnly/MULTI_GAME_ARCHITECTURE.md` - Multi-game refactoring
- `LocalOnly/REFACTORING_PLAN.md` - Detailed refactoring steps