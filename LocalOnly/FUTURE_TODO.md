# Future TODO List

This document tracks planned features and improvements for the Wuthering Waves Planner, organized by priority.

Last Updated: 2026-01-23

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

### 2. Apply Phase 1 Improvements to Existing Code
**Status:** Lower Priority (User Requested)
**Priority:** Moved to Low Priority
**Reference:** `LocalOnly/PHASE1_IMPLEMENTATION_GUIDE.md`

**Tasks (Lower Priority):**
- [ ] Replace all `console.log` with `logger.debug` throughout codebase
- [ ] Replace all `console.warn` with `logger.warn`
- [ ] Replace all `console.error` with `logger.error`
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
- [ ] **Refactor stamina/resin calculation to be game-agnostic**
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

### 4. Stamina Tracker
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

### 5. Notes Module
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

### 6. Material Farming Routes
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

### 7. Team Planner
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
