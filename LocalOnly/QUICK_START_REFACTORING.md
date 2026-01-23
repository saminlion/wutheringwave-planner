# Quick Start: Multi-Game Refactoring

A guide to get started quickly with the multi-game refactoring. Everything is prepared for immediate implementation.

---

## Document Overview

We have created 3 documents:

### 1. **MULTI_GAME_ARCHITECTURE.md** - Architecture Overview
- Game-agnostic vs game-specific code analysis
- Plugin architecture design
- Game-specific configuration structure
- Example code

**When to read:** To understand the overall structure

### 2. **REFACTORING_PLAN.md** - Detailed Implementation Plan
- Phase-by-phase detailed task guide (9 phases planned)
- Code examples and file structure
- Testing approach
- Completion criteria

**When to read:** Day-to-day implementation work guide

### 3. **QUICK_START_REFACTORING.md** (this document) - Quick Start
- Rapid summary for immediate implementation
- Checklists

---

## Core Summary

### Current Situation
The current codebase is **specific to Wuthering Waves**.

### Goal
Transform into a **multi-game plugin system**:
- Extract core logic (material synthesis, calculations) as **game-agnostic**
- Separate game-specific data and configuration into **plugins**
- Make adding new games as simple as **creating a new plugin**

### Reusable Core Systems

These **already work across games**:
1. Material synthesis - 3:1 material synthesis logic
2. Material calculation - Material calculation and merging
3. Experience optimization - Experience optimization
4. Inventory management - Inventory management (already supports gameId!)

### What Needs Refactoring

These are **game-specific**:
1. Material category definitions (hardcoded in core.js)
2. Character/weapon data structure (WW-specific level format, skills)
3. Cost data (costs.json with WW leveling costs)
4. Tier definitions (tieredMaterials.js with WW material chains)

---

## Implementation Phases

### Phase 1: Core Engine Extraction (2 days)
Extract synthesis, calculator, and progression logic into `src/core/engine/`.

**Key deliverables:**
- `src/core/engine/synthesis.js` - Generic synthesis engine
- `src/core/engine/calculator.js` - Generic material calculator
- `src/core/engine/progression.js` - Generic progression engine

### Phase 2: WW Plugin Migration (3 days)
Move all WW-specific data and logic to `src/games/wutheringwave/`.

**Key deliverables:**
- `src/games/wutheringwave/config.js` - Game configuration
- `src/games/wutheringwave/data/` - All WW data files
- `src/games/wutheringwave/index.js` - Plugin entry point

### Phase 3: Game Registry (2 days)
Create game registry system for managing multiple games.

**Key deliverables:**
- `src/store/gameRegistry.js` - Pinia store for game management
- Update `main.js` to register games
- Update views to use game registry

### Phase 4: Testing (1 day)
Ensure refactored code produces identical results.

**Key deliverables:**
- Integration tests for WW plugin
- Comparison tests vs old system
- Regression testing

### Phase 5: Documentation (1 day)
Complete documentation for future developers.

**Key deliverables:**
- Plugin development guide
- Migration guide for existing code
- Example plugin template

---

## Quick Start Steps

### Step 1: Create Branch
```bash
git checkout -b refactor/multi-game-support
```

### Step 2: Create Core Directory
```bash
mkdir -p src/core/engine
touch src/core/engine/synthesis.js
touch src/core/engine/calculator.js
touch src/core/engine/progression.js
touch src/core/index.js
```

### Step 3: Read Detailed Plan
Open `REFACTORING_PLAN.md` and follow Phase 1 instructions.

---

## Success Criteria

After refactoring:
- [ ] Core engine is 100% game-agnostic
- [ ] WW data lives in plugin at `src/games/wutheringwave/`
- [ ] Can switch games via registry
- [ ] All tests pass
- [ ] Zero breaking changes for users
- [ ] Adding new game takes < 1 day

---

## Adding a New Game (After Refactoring)

When refactoring is complete, adding a new game is simple:

```bash
# 1. Create plugin directory
mkdir -p src/games/genshin-impact/data

# 2. Create config file (copy and modify WW config)
cp src/games/wutheringwave/config.js src/games/genshin-impact/config.js

# 3. Add game data
# - characters.json
# - weapons.json
# - materials.json
# - costs.json
# - tiers.json

# 4. Register in main.js
import genshinPlugin from './games/genshin-impact';
gameRegistry.register(genshinPlugin);
```

**Done!** New game is ready to use.

---

## Key Principles

1. **Don't delete old code immediately** - Keep for comparison during migration
2. **Test at each phase** - Ensure identical behavior before moving on
3. **Use feature flags** - Switch between old/new systems during testing
4. **Document differences** - Note any intentional changes from original

---

## Need More Details?

- **Architecture questions** → Read `MULTI_GAME_ARCHITECTURE.md`
- **Implementation steps** → Read `REFACTORING_PLAN.md`
- **Original codebase** → https://github.com/saminlion/wutheringwave-planner

---

## Timeline

**Total: ~9 days (2 weeks)**

- Phase 1: 2 days (Core extraction)
- Phase 2: 3 days (WW plugin)
- Phase 3: 2 days (Game registry)
- Phase 4: 1 day (Testing)
- Phase 5: 1 day (Documentation)

---

## Ready to Start?

1. Read `REFACTORING_PLAN.md` Phase 1
2. Create branch: `git checkout -b refactor/multi-game-support`
3. Create core directories (see Step 2 above)
4. Start implementing Phase 1.2 from the plan

Good luck! 🚀
