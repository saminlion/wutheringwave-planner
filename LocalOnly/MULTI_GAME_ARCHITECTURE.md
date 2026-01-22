# Multi-Game Planner Architecture Design

## Current Analysis

### Game-Agnostic Systems (Reusable Core)

These systems work with ANY game that has similar progression mechanics:

#### 1. **Material Synthesis Engine** (`synthesis.js`)
- **Forward Synthesis**: 3 lower-tier items → 1 higher-tier item
- **Backward Conversion**: 1 higher-tier item → 3 lower-tier items (for surplus)
- Generic tier-based progression logic
- Inventory-aware synthesis (considers shortages)

**Why it's reusable:**
- Works with ANY tiered material system (common in gacha games)
- Only needs tier definitions as input
- No Wuthering Waves-specific logic

#### 2. **Material Calculation Core** (`plannerCalc.js`)
- **mergeMaterials()**: Combines multiple material requirements
- **getLevelRangeDiff()**: Calculates progression between levels
- Orchestrates synthesis pipeline

**Why it's reusable:**
- Pure mathematical operations
- Works with any level-based progression
- Generic data structures

#### 3. **Experience Calculation** (`core.js::calculatePlayerExp`)
- EXP optimization algorithm (uses highest value items first)
- Works with any EXP material system

**Why it's reusable:**
- Generic greedy algorithm
- Only needs EXP values as input

#### 4. **Inventory Management** (`store/inventory.js`)
- Add/Remove materials
- LocalStorage persistence
- Multi-game ID support (already has `gameId` parameter!)

**Why it's reusable:**
- Already designed for multiple games
- Generic CRUD operations

---

### Game-Specific Components (Needs Abstraction)

#### 1. **Material Category Schema** (`core.js::processMaterials`)

**Current problem:**
```javascript
// Hardcoded category names
if (materialCategory === 'common') { ... }
if (materialCategory === 'forgery') { ... }
```

**Solution:**
```javascript
// Move to game config
gameConfig.materials.categories = {
  common: { tiered: true, tiers: 4 },
  forgery: { tiered: true, tiers: 4 },
  ascension: { tiered: false },
  // ...
};
```

#### 2. **Character/Weapon Data Structure**

**Current problem:**
- WW-specific level format ("1", "20", "20A", "40A", ..., "90")
- WW-specific skill structure (5 active skills, 10 passive slots)
- Hardcoded in character.js and weapon.js

**Solution:**
```javascript
// Game-specific progression schema
gameConfig.progression = {
  character: {
    levels: {
      format: 'ascension',  // WW uses ascension format
      values: ['1', '20', '20A', '40', ...],
    },
    skills: {
      active: { count: 5, maxLevel: 10 },
      passive: { tiers: 2, slotsPerTier: 5 }
    }
  },
  weapon: {
    levels: {
      format: 'ascension',
      values: ['1', '20', '20A', '40', ...]
    }
  }
};
```

#### 3. **Cost Data** (`costs.json`)

**Current problem:**
- 200KB JSON file with WW-specific leveling costs
- Hardcoded paths like `character.level["20A"]`, `character.skill["5"]`

**Solution:**
- Move to game plugin: `src/games/wutheringwave/data/costs.json`
- Core engine receives costs as parameter

#### 4. **Tier Definitions** (`tieredMaterials.js`)

**Current problem:**
```javascript
// WW-specific material chains
export const tieredMaterials = {
  "whisperin_core": ["LF Whisperin Core", "MF Whisperin Core", ...],
  // ...
};
```

**Solution:**
- Move to game plugin: `src/games/wutheringwave/data/tiers.js`
- Core synthesis engine receives tier definitions as parameter

---

## Proposed Architecture

### Directory Structure
