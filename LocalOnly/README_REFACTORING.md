# Multi-Game Planner Refactoring

Welcome to the multi-game planner refactoring documentation!

---

## Complete Documentation

We have created **3 detailed documents**:

### 1. [MULTI_GAME_ARCHITECTURE.md](./MULTI_GAME_ARCHITECTURE.md)
**Overall Architecture Overview**
- Game-agnostic vs game-specific code analysis
- Plugin system architecture
- Game configuration structure
- Example code

**When to read:** To understand the overall structure and approach

### 2. [REFACTORING_PLAN.md](./REFACTORING_PLAN.md)
**Detailed Implementation Plan (9 Phases)**
- Step-by-step guides for each phase
- Actual code examples
- File structure
- Testing approach
- Completion criteria

**When to read:** For actual implementation work

### 3. [QUICK_START_REFACTORING.md](./QUICK_START_REFACTORING.md)
**Quick Start Guide**
- Core summary
- How to get started immediately
- Checklists

**When to read:** To get started right away

---

## Core Idea

### Current State
```
Wuthering Waves-specific planner
- Material synthesis logic (3:1) is generic
- Material calculation logic is generic
- WW character data is game-specific
- WW weapon data is game-specific
- WW material data is game-specific
```

### Target State
```
Multi-game planner platform
- Core engine (synthesis, calculation) is reusable
- Game-specific data lives in plugins
- Adding a new game = Create new plugin
```

### Benefits
1. Add new games without touching core code
2. Maintain game-specific features separately
3. Share improvements across all games
4. Clean separation of concerns

---

## Core Systems (Already Reusable!)

These are already game-agnostic and work as-is:

1. **synthesis.js** - 3:1 material synthesis
   - Forward synthesis (3 low-tier → 1 high-tier)
   - Backward conversion (1 high-tier → 3 low-tier for surplus)

2. **plannerCalc.js** - Material calculation and merging
   - Level range calculations
   - Material merging logic

3. **core.js::calculatePlayerExp** - Experience optimization
   - Greedy algorithm for optimal EXP usage

4. **store/inventory.js** - Inventory management
   - Already supports multiple gameIds!

---

## What Needs Refactoring?

Game-specific parts that need to be extracted:

1. **Material Processing** (core.js::processMaterials)
   - Hardcoded material category names
   - → Move to game config

2. **Character/Weapon Data Structure**
   - WW-specific level format ("20A", "40A", etc.)
   - WW-specific skill structure
   - → Define per-game schemas

3. **Tier Definitions** (tieredMaterials.js)
   - Hardcoded WW material chains
   - → Move to game plugin

4. **Cost Data** (costs.json)
   - WW-specific leveling costs
   - → Move to game plugin

---

## Refactoring Phases

```
Phase 1: Core Engine Extraction (Days 1-2)
├─ Extract synthesis engine
├─ Extract calculator
├─ Extract progression logic
└─ Create core/engine directory

Phase 2: Type System (Days 3-4)
├─ Define game schema interfaces
├─ Define material schemas
└─ Create validation system

Phase 3: Plugin Architecture (Days 5-7)
├─ Create plugin loader
├─ Define plugin API
└─ Create base plugin class

Phase 4: WW Plugin Migration (Days 8-10)
├─ Move WW data to plugin
├─ Implement WW-specific logic
└─ Test against original behavior

Phase 5-9: Polish, testing, optimization
```

---

## Quick Decision Guide

**I want to understand the architecture:**
→ Read [MULTI_GAME_ARCHITECTURE.md](./MULTI_GAME_ARCHITECTURE.md)

**I'm ready to start implementation:**
→ Read [REFACTORING_PLAN.md](./REFACTORING_PLAN.md)

**I want to start immediately:**
→ Read [QUICK_START_REFACTORING.md](./QUICK_START_REFACTORING.md)

**I want to add a new game after refactoring:**
→ See [MULTI_GAME_ARCHITECTURE.md#Adding a New Game](./MULTI_GAME_ARCHITECTURE.md)

---

## Success Criteria

After refactoring is complete:

- [ ] All existing WW functionality works identically
- [ ] Core engine is 100% game-agnostic
- [ ] WW data lives in /src/games/wutheringwave/ plugin
- [ ] Adding HSR game takes < 1 day (just create plugin)
- [ ] Tests pass for all phases
- [ ] Zero breaking changes for end users

---

## Repository Reference

**GitHub:** https://github.com/saminlion/wutheringwave-planner

Always refer to the original implementation when refactoring to ensure behavior preservation.

