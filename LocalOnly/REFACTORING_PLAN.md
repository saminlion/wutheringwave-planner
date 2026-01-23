# Refactoring Plan: Multi-Game Support

## ?뱥 Step-by-Step Implementation Guide

This document provides a detailed, executable plan to refactor the current Wuthering Waves planner into a multi-game platform.

---

## ?뵕 GitHub Repository Reference

**Repository:** https://github.com/saminlion/wutheringwave-planner

**Important:** During refactoring, always refer to the original implementation on GitHub master branch for:
- Original component logic and structure
- Data flow patterns
- Component interactions
- UI/UX behavior

**Quick Reference Links:**
- [Original FinalMaterialNeeds.vue](https://github.com/saminlion/wutheringwave-planner/blob/master/src/components/planner/FinalMaterialNeeds.vue)
- [Original PlannerView.vue](https://github.com/saminlion/wutheringwave-planner/blob/master/src/views/PlannerView.vue)
- [Original Material Helpers](https://github.com/saminlion/wutheringwave-planner/tree/master/src/services/materialHelper)
- [Original Data Files](https://github.com/saminlion/wutheringwave-planner/tree/master/src/data)

**Best Practices:**
1. **Before refactoring any component**, review the original implementation on GitHub
2. **Preserve original functionality** - ensure refactored code produces identical results
3. **Test against original behavior** - compare outputs with master branch
4. **Document differences** - note any intentional changes from the original

---

## Phase 1: Core Engine Extraction (Days 1-2)

### Goal
Extract game-agnostic logic into reusable core modules.

### Step 1.1: Create Core Directory Structure

```bash
mkdir -p src/core/engine
mkdir -p src/core/types
touch src/core/engine/synthesis.js
touch src/core/engine/calculator.js
touch src/core/engine/progression.js
touch src/core/engine/inventory.js
touch src/core/index.js
```

### Step 1.2: Extract Synthesis Engine

**Source:** `src/services/materialHelper/synthesis.js`
**Destination:** `src/core/engine/synthesis.js`

**Changes needed:**
```javascript
// OLD: Hardcoded imports
import inventoryItem from '../../data/inventoryItem.json';

// NEW: Accept as parameters
export class SynthesisEngine {
  constructor(config = {}) {
    this.ratio = config.ratio || 3;  // Default 3:1
    this.tierLevels = config.tierLevels || 4;
  }

  // OLD: performItemSynthesisWithNeeds(inventory, tieredMaterials, shortages)
  // NEW: Same signature but remove hardcoded dependencies
  forward(inventory, tieredMaterials, shortages, inventoryItemDb) {
    const synthesisResults = {};
    const rawNeedResults = {};

    // Use passed inventoryItemDb instead of import
    const uniqueSubCategories = this._findUniqueSubCategories(
      inventoryItemDb,
      shortages
    );

    // ... rest of logic unchanged
  }

  backward(inventory, tieredMaterials, shortages) {
    // Move backwardConversion logic here
    // No changes needed - already generic!
  }

  _findUniqueSubCategories(inventoryItemDb, shortages) {
    // Move from dbUtils to here as private method
  }
}
```

**Files to create:**
- `src/core/engine/synthesis.js` - New class-based synthesis engine

**Tests to write:**
```javascript
// tests/core/synthesis.test.js
describe('SynthesisEngine', () => {
  it('should synthesize 3:1 ratio by default', () => {
    const engine = new SynthesisEngine();
    expect(engine.ratio).toBe(3);
  });

  it('should support custom ratios', () => {
    const engine = new SynthesisEngine({ ratio: 4 });
    expect(engine.ratio).toBe(4);
  });
});
```

### Step 1.3: Extract Progression Calculator

**Source:** `src/services/materialHelper/plannerCalc.js` + `core.js`
**Destination:** `src/core/engine/calculator.js`

**New structure:**
```javascript
export class MaterialCalculator {
  constructor(gameConfig) {
    this.config = gameConfig;
    this.synthesis = new SynthesisEngine(gameConfig.materials.synthesis);
  }

  // Generic calculation pipeline
  calculate(inventory, tieredMaterials, shortages) {
    const forwardResult = this.synthesis.forward(
      inventory,
      tieredMaterials,
      shortages,
      this.config.materials.database
    );

    const finalNeeds = this.synthesis.backward(
      forwardResult.updatedInventory,
      tieredMaterials,
      shortages
    );

    return {
      final_inventory: forwardResult.updatedInventory,
      synthesis_results: forwardResult.synthesisResults,
      final_needs: finalNeeds,
      synthesized_per_game_id: this._extractSynthesized(forwardResult),
      raw_needs: this._extractRawNeeds(forwardResult)
    };
  }

  // Generic merge - already perfect!
  merge(...materialSources) {
    const merged = {};
    materialSources.forEach((source) => {
      Object.entries(source).forEach(([material, amount]) => {
        merged[material] = (merged[material] || 0) + amount;
      });
    });
    return merged;
  }

  // Generic level range extraction
  getLevelRange(levelData, currentLevel, targetLevel) {
    // Copy from getLevelRangeDiff - already generic!
  }
}
```

### Step 1.4: Extract Progression Logic

**Source:** `src/services/materialHelper/character.js`, `weapon.js`
**Destination:** `src/core/engine/progression.js`

**New structure:**
```javascript
export class ProgressionEngine {
  constructor(gameConfig) {
    this.config = gameConfig;
    this.calculator = new MaterialCalculator(gameConfig);
  }

  // Generic method - works for ANY entity (character, weapon, etc.)
  calculateUpgrade(entity, currentState, targetState, costsDb) {
    const materials = {};

    // Calculate level materials
    if (currentState.level !== targetState.level) {
      const levelMaterials = this._calculateLevelMaterials(
        entity,
        currentState.level,
        targetState.level,
        costsDb
      );
      Object.assign(materials, levelMaterials);
    }

    // Calculate skill materials (if entity has skills)
    if (this.config.progression[entity.type].skills) {
      const skillMaterials = this._calculateSkillMaterials(
        entity,
        currentState.skills,
        targetState.skills,
        costsDb
      );
      Object.assign(materials, skillMaterials);
    }

    return materials;
  }

  _calculateLevelMaterials(entity, currentLevel, targetLevel, costsDb) {
    // Generic implementation using config
  }

  _calculateSkillMaterials(entity, currentSkills, targetSkills, costsDb) {
    // Generic implementation using config
  }
}
```

### Step 1.5: Core Index (Public API)

**File:** `src/core/index.js`

```javascript
// Core exports - stable API
export { SynthesisEngine } from './engine/synthesis.js';
export { MaterialCalculator } from './engine/calculator.js';
export { ProgressionEngine } from './engine/progression.js';

// Convenience factory
export function createGameEngine(gameConfig) {
  return {
    synthesis: new SynthesisEngine(gameConfig.materials.synthesis),
    calculator: new MaterialCalculator(gameConfig),
    progression: new ProgressionEngine(gameConfig)
  };
}
```

---

## Phase 2: Wuthering Waves Plugin (Days 3-5)

### Goal
Migrate all WW-specific code to a plugin structure.

### Step 2.1: Create Plugin Directory

```bash
mkdir -p src/games/wutheringwave/data
mkdir -p src/games/wutheringwave/schemas
mkdir -p src/games/wutheringwave/helpers
```

### Step 2.2: Move Data Files

```bash
# Move all WW data to plugin folder
mv src/data/character.json src/games/wutheringwave/data/
mv src/data/weapon.json src/games/wutheringwave/data/
mv src/data/inventoryItem.json src/games/wutheringwave/data/materials.json
mv src/data/costs.json src/games/wutheringwave/data/
mv src/data/tieredMaterials.js src/games/wutheringwave/data/tiers.js

# Keep these as they might be UI-specific
# src/data/icon.json
# src/data/skillicon.json
```

### Step 2.3: Create Game Configuration

**File:** `src/games/wutheringwave/config.js`

```javascript
export const wutheringWaveConfig = {
  // === Metadata ===
  id: 'wutheringwave',
  name: 'Wuthering Waves',
  shortName: 'WW',
  version: '1.4.0',

  // === Material System ===
  materials: {
    // Material category definitions
    categories: {
      credit: {
        id: 'credit',
        label: 'Shell Credits',
        icon: 'currency',
        type: 'currency',
        gameIdPrefix: '410010'
      },
      common: {
        id: 'common',
        label: 'Common Materials',
        icon: 'common',
        type: 'tiered',
        tiers: 4
      },
      forgery: {
        id: 'forgery',
        label: 'Forgery Materials',
        icon: 'forgery',
        type: 'tiered',
        tiers: 4
      },
      ascension: {
        id: 'ascension',
        label: 'Ascension Materials',
        icon: 'ascension',
        type: 'unique'
      },
      boss: {
        id: 'boss',
        label: 'Boss Materials',
        icon: 'boss',
        type: 'unique'
      },
      weeklyBoss: {
        id: 'weeklyBoss',
        label: 'Weekly Boss Materials',
        icon: 'weekly',
        type: 'unique'
      }
    },

    // Display order for UI
    displayOrder: [
      'credit',
      'common',
      'forgery',
      'ascension',
      'boss',
      'weeklyBoss',
      'player_exp',
      'weapon_exp'
    ],

    // Synthesis configuration
    synthesis: {
      enabled: true,
      ratio: 3,  // 3 lower ??1 higher
      tierLevels: 4,  // LF ??MF ??HF ??FF

      // Which categories support synthesis
      synthesizable: ['common', 'forgery']
    },

    // Experience materials
    experience: {
      character: {
        category: 'player_exp',
        materials: {
          41601001: { name: 'Basic Resonance Potion', value: 1000, rarity: 2 },
          41601002: { name: 'Medium Resonance Potion', value: 3000, rarity: 3 },
          41601003: { name: 'Advanced Resonance Potion', value: 8000, rarity: 4 },
          41601004: { name: 'Premium Resonance Potion', value: 20000, rarity: 5 }
        }
      },
      weapon: {
        category: 'weapon_exp',
        materials: {
          41701001: { name: 'Basic Energy Core', value: 1000, rarity: 2 },
          41701002: { name: 'Medium Energy Core', value: 3000, rarity: 3 },
          41701003: { name: 'Advanced Energy Core', value: 8000, rarity: 4 },
          41701004: { name: 'Premium Energy Core', value: 20000, rarity: 5 }
        }
      }
    }
  },

  // === Progression System ===
  progression: {
    character: {
      // Level system
      levels: {
        format: 'ascension',  // "1", "20", "20A", "40", "40A", etc.
        min: 1,
        max: 90,
        ascensionLevels: [20, 40, 50, 60, 70, 80],

        // Level string parser
        parseLevel: (levelStr) => {
          const isAscended = levelStr.endsWith('A');
          const baseLevel = parseInt(levelStr.replace('A', ''));
          return { baseLevel, isAscended };
        },

        // Level string formatter
        formatLevel: (level, isAscended) => {
          return isAscended ? `${level}A` : `${level}`;
        }
      },

      // Skill system
      skills: {
        active: {
          slots: [
            { id: 'primary_attack', label: 'Basic Attack', icon: 'skill_1' },
            { id: 'special_ability', label: 'Resonance Skill', icon: 'skill_2' },
            { id: 'ultimate_move', label: 'Resonance Liberation', icon: 'skill_3' },
            { id: 'support_skill', label: 'Forte Circuit', icon: 'skill_4' },
            { id: 'enhanced_mode', label: 'Intro Skill', icon: 'skill_5' }
          ],
          minLevel: 1,
          maxLevel: 10
        },

        passive: {
          structure: {
            tiers: 2,
            perTier: {
              mainPassive: 1,
              statBonuses: 4
            }
          },
          slots: [
            // Tier 1
            { id: 'passive_ability_1', tier: 1, type: 'main', label: 'Inherent Skill 1' },
            { id: 'bonus_stats_1_1', tier: 1, type: 'stat', label: 'Stat Bonus 1.1' },
            { id: 'bonus_stats_1_2', tier: 1, type: 'stat', label: 'Stat Bonus 1.2' },
            { id: 'bonus_stats_1_3', tier: 1, type: 'stat', label: 'Stat Bonus 1.3' },
            { id: 'bonus_stats_1_4', tier: 1, type: 'stat', label: 'Stat Bonus 1.4' },
            // Tier 2
            { id: 'passive_ability_2', tier: 2, type: 'main', label: 'Inherent Skill 2' },
            { id: 'bonus_stats_2_1', tier: 2, type: 'stat', label: 'Stat Bonus 2.1' },
            { id: 'bonus_stats_2_2', tier: 2, type: 'stat', label: 'Stat Bonus 2.2' },
            { id: 'bonus_stats_2_3', tier: 2, type: 'stat', label: 'Stat Bonus 2.3' },
            { id: 'bonus_stats_2_4', tier: 2, type: 'stat', label: 'Stat Bonus 2.4' }
          ]
        }
      }
    },

    weapon: {
      levels: {
        format: 'ascension',
        min: 1,
        max: 90,
        ascensionLevels: [20, 40, 50, 60, 70, 80]
      }
      // No skills for weapons
    }
  },

  // === Cost Schema ===
  costs: {
    // How to interpret costs.json
    schema: {
      character: {
        level: {
          path: 'character.level',
          fields: {
            common: { type: 'tiered', format: '[quantity, tier]' },
            forgery: { type: 'tiered', format: '[quantity, tier]' },
            ascension: { type: 'quantity' },
            boss: { type: 'quantity' },
            credit: { type: 'quantity' },
            player_exp: { type: 'experience' }
          }
        },
        skill: {
          path: 'character.skill',
          fields: {
            common: { type: 'tiered', format: '[quantity, tier]' },
            forgery: { type: 'tiered', format: '[quantity, tier]' },
            weeklyBoss: { type: 'quantity' },
            credit: { type: 'quantity' }
          }
        },
        passive: {
          path: 'character.passive.skill',
          fields: {
            common: { type: 'tiered', format: '[quantity, tier]' },
            forgery: { type: 'tiered', format: '[quantity, tier]' },
            credit: { type: 'quantity' }
          }
        }
      },
      weapon: {
        level: {
          path: 'weapon.level',
          fields: {
            common: { type: 'tiered', format: '[quantity, tier]' },
            ascension: { type: 'quantity' },
            credit: { type: 'quantity' },
            weapon_exp: { type: 'experience' }
          }
        }
      }
    }
  },

  // === UI Configuration ===
  ui: {
    theme: {
      primary: '#6B60B5',
      secondary: '#C88844',

      // Rarity colors
      rarity: {
        2: '#5AC85A',  // Green
        3: '#3b82f680',  // Blue
        4: '#6B60B5',  // Purple
        5: '#C88844'  // Gold
      },

      // Element colors
      element: {
        glacio: '#00BFFF',    // Ice blue
        fusion: '#FF6347',    // Red
        electro: '#9370DB',   // Purple
        aero: '#00CED1',      // Cyan
        spectro: '#FFD700',   // Gold
        havoc: '#8B008B'      // Dark purple
      }
    },

    // Field mappings for display
    fields: {
      character: {
        id: 'game_id',
        name: 'display_name',
        icon: 'icon',
        element: 'element',
        weapon: 'weapon',
        rarity: 'rarity',
        description: 'description'
      },
      weapon: {
        id: 'game_id',
        name: 'display_name',
        icon: 'icon',
        type: 'type',
        rarity: 'rarity',
        description: 'description'
      },
      material: {
        id: 'game_id',
        name: 'label',
        icon: 'icon',
        category: 'Category',
        subCategory: 'SubCategory',
        rarity: 'rarity'
      }
    },

    // Gradient style generator
    gradient: (entity) => {
      const rarityColor = this.ui.theme.rarity[entity.rarity] || '#6B60B5';
      const elementColor = entity.element
        ? this.ui.theme.element[entity.element]
        : rarityColor;

      return `linear-gradient(180deg, ${rarityColor} 40%, ${elementColor} 59%)`;
    }
  },

  // === Data Loaders ===
  data: {
    async loadCharacters() {
      return (await import('./data/character.json')).default;
    },
    async loadWeapons() {
      return (await import('./data/weapon.json')).default;
    },
    async loadMaterials() {
      return (await import('./data/materials.json')).default;
    },
    async loadCosts() {
      return (await import('./data/costs.json')).default;
    },
    async loadTiers() {
      const { tieredMaterials } = await import('./data/tiers.js');
      return tieredMaterials;
    }
  }
};
```

### Step 2.4: Create Plugin Entry Point

**File:** `src/games/wutheringwave/index.js`

```javascript
import { wutheringWaveConfig } from './config.js';
import { createCharacterHelper } from './helpers/characterHelper.js';
import { createWeaponHelper } from './helpers/weaponHelper.js';

export default {
  // Plugin metadata
  id: wutheringWaveConfig.id,
  name: wutheringWaveConfig.name,
  version: wutheringWaveConfig.version,

  // Plugin configuration
  config: wutheringWaveConfig,

  // Loaded data cache
  _dataCache: {},

  // === Lifecycle Hooks ===
  async install(app, options = {}) {
    console.log(`[Plugin] Loading ${this.name}...`);

    // Preload critical data
    await this.preloadData();

    // Register helpers
    this.helpers = {
      character: createCharacterHelper(this._dataCache.characters),
      weapon: createWeaponHelper(this._dataCache.weapons)
    };

    console.log(`[Plugin] ${this.name} loaded successfully!`);
  },

  async uninstall() {
    console.log(`[Plugin] Unloading ${this.name}...`);
    this._dataCache = {};
    this.helpers = null;
  },

  // === Data Management ===
  async preloadData() {
    this._dataCache.characters = await this.config.data.loadCharacters();
    this._dataCache.weapons = await this.config.data.loadWeapons();
    this._dataCache.materials = await this.config.data.loadMaterials();
    this._dataCache.costs = await this.config.data.loadCosts();
    this._dataCache.tiers = await this.config.data.loadTiers();
  },

  getData(type) {
    return this._dataCache[type];
  },

  // === Helpers ===
  getCharacter(id) {
    return this.helpers.character.getById(id);
  },

  getWeapon(id) {
    return this.helpers.weapon.getById(id);
  },

  getMaterial(id) {
    const materials = this._dataCache.materials;
    return Object.values(materials)
      .flatMap(category => Object.values(category))
      .find(item => String(item.game_id) === String(id));
  }
};
```

---

## Phase 3: Game Registry System (Days 6-7)

### Step 3.1: Create Game Registry Store

**File:** `src/store/gameRegistry.js`

```javascript
import { defineStore } from 'pinia';
import { createGameEngine } from '@/core';
import logger from '@/utils/logger';

export const useGameRegistry = defineStore('gameRegistry', {
  state: () => ({
    // Registered games
    games: {},

    // Currently active game
    currentGameId: null,

    // Loaded game instances
    loadedGames: {}
  }),

  getters: {
    // Get current game plugin
    current: (state) => {
      return state.loadedGames[state.currentGameId] || null;
    },

    // Get current game config
    currentConfig: (state) => {
      const game = state.loadedGames[state.currentGameId];
      return game?.config || null;
    },

    // Get current game engine
    currentEngine: (state) => {
      const game = state.loadedGames[state.currentGameId];
      return game?.engine || null;
    },

    // List all registered games
    availableGames: (state) => {
      return Object.values(state.games);
    }
  },

  actions: {
    // Register a game plugin
    register(gamePlugin) {
      if (this.games[gamePlugin.id]) {
        logger.warn(`Game "${gamePlugin.id}" is already registered`);
        return false;
      }

      this.games[gamePlugin.id] = {
        id: gamePlugin.id,
        name: gamePlugin.name,
        version: gamePlugin.version,
        plugin: gamePlugin
      };

      logger.info(`Registered game: ${gamePlugin.name}`);
      return true;
    },

    // Load and activate a game
    async loadGame(gameId) {
      if (!this.games[gameId]) {
        logger.error(`Game "${gameId}" is not registered`);
        return false;
      }

      // Unload previous game
      if (this.currentGameId && this.currentGameId !== gameId) {
        await this.unloadGame(this.currentGameId);
      }

      try {
        const gameInfo = this.games[gameId];
        const gamePlugin = gameInfo.plugin;

        // Install plugin
        await gamePlugin.install();

        // Create game engine
        const engine = createGameEngine(gamePlugin.config);

        // Store loaded game
        this.loadedGames[gameId] = {
          plugin: gamePlugin,
          config: gamePlugin.config,
          engine: engine,
          data: gamePlugin._dataCache
        };

        this.currentGameId = gameId;

        // Persist to localStorage
        localStorage.setItem('wwplanner_current_game', gameId);

        logger.info(`Loaded game: ${gamePlugin.name}`);
        return true;

      } catch (error) {
        logger.error(`Failed to load game "${gameId}":`, error);
        return false;
      }
    },

    // Unload a game
    async unloadGame(gameId) {
      const loadedGame = this.loadedGames[gameId];
      if (!loadedGame) return;

      try {
        await loadedGame.plugin.uninstall();
        delete this.loadedGames[gameId];

        if (this.currentGameId === gameId) {
          this.currentGameId = null;
        }

        logger.info(`Unloaded game: ${loadedGame.plugin.name}`);
      } catch (error) {
        logger.error(`Failed to unload game "${gameId}":`, error);
      }
    },

    // Switch to a different game
    async switchGame(gameId) {
      return await this.loadGame(gameId);
    },

    // Restore last used game from localStorage
    async restoreLastGame() {
      const lastGameId = localStorage.getItem('wwplanner_current_game');
      if (lastGameId && this.games[lastGameId]) {
        await this.loadGame(lastGameId);
      } else if (Object.keys(this.games).length > 0) {
        // Load first available game
        const firstGameId = Object.keys(this.games)[0];
        await this.loadGame(firstGameId);
      }
    }
  }
});
```

### Step 3.2: Bootstrap Games in main.js

**File:** `src/main.js`

```javascript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Import game plugins
import wutheringWavePlugin from './games/wutheringwave';
// import genshinImpactPlugin from './games/genshin-impact';  // Future
// import honkaiStarRailPlugin from './games/honkai-starrail';  // Future

import { useGameRegistry } from './store/gameRegistry';

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);

  // Initialize game registry
  const gameRegistry = useGameRegistry();

  // Register all available game plugins
  gameRegistry.register(wutheringWavePlugin);
  // gameRegistry.register(genshinImpactPlugin);
  // gameRegistry.register(honkaiStarRailPlugin);

  // Restore last used game
  await gameRegistry.restoreLastGame();

  // Mount app
  app.mount('#app');
}

bootstrap();
```

### Step 3.3: Update Views to Use Game Registry

**File:** `src/views/PlannerView.vue` (example changes)

```javascript
// OLD
import { getCharacterField } from "@/services/characterHelper";
import { getWeaponField } from "@/services/weaponHelper";
import costs from "@/data/costs.json";

// NEW
import { useGameRegistry } from "@/store/gameRegistry";

const gameRegistry = useGameRegistry();
const currentGame = computed(() => gameRegistry.current);
const gameEngine = computed(() => gameRegistry.currentEngine);

// OLD
const characterName = getCharacterField(characterId, 'display_name');

// NEW
const characterName = currentGame.value.getCharacter(characterId).display_name;

// OLD
const materials = calculateCharacterMaterials(character, settings, costs);

// NEW
const materials = gameEngine.value.progression.calculateUpgrade(
  character,
  settings.current,
  settings.target,
  currentGame.value.getData('costs')
);
```

---

## Phase 4: Testing & Validation (Day 8)

### Step 4.1: Create Test Suite

**File:** `tests/integration/ww-plugin.test.js`

```javascript
import { describe, it, expect, beforeAll } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGameRegistry } from '@/store/gameRegistry';
import wutheringWavePlugin from '@/games/wutheringwave';

describe('Wuthering Waves Plugin Integration', () => {
  beforeAll(async () => {
    setActivePinia(createPinia());
    const registry = useGameRegistry();
    registry.register(wutheringWavePlugin);
    await registry.loadGame('wutheringwave');
  });

  it('should load WW plugin successfully', () => {
    const registry = useGameRegistry();
    expect(registry.current).toBeTruthy();
    expect(registry.currentGameId).toBe('wutheringwave');
  });

  it('should have correct configuration', () => {
    const registry = useGameRegistry();
    expect(registry.currentConfig.id).toBe('wutheringwave');
    expect(registry.currentConfig.materials.synthesis.ratio).toBe(3);
  });

  it('should load character data', () => {
    const registry = useGameRegistry();
    const character = registry.current.getCharacter(42000001);  // Rover
    expect(character).toBeTruthy();
    expect(character.display_name).toBeDefined();
  });

  it('should calculate materials correctly', async () => {
    const registry = useGameRegistry();
    const engine = registry.currentEngine;

    // Test calculation produces same results as old system
    const materials = engine.calculator.calculate(
      { /* inventory */ },
      { /* tiers */ },
      { /* shortages */ }
    );

    expect(materials.final_needs).toBeDefined();
  });
});
```

### Step 4.2: Comparison Testing

Create script to validate that refactored system produces identical results:

**File:** `tests/validation/compare-results.js`

```javascript
import oldCalculate from '@/services/materialHelper/plannerCalc';  // Keep old for comparison
import { useGameRegistry } from '@/store/gameRegistry';

async function compareResults() {
  const testCases = [
    {
      character: { /* ... */ },
      settings: { /* ... */ }
    },
    // ... more test cases
  ];

  for (const testCase of testCases) {
    const oldResult = oldCalculate(testCase);
    const newResult = gameRegistry.currentEngine.calculate(testCase);

    const match = JSON.stringify(oldResult) === JSON.stringify(newResult);

    console.log(`Test case ${testCase.name}: ${match ? '??PASS' : '??FAIL'}`);

    if (!match) {
      console.log('Old:', oldResult);
      console.log('New:', newResult);
    }
  }
}
```

---

## Phase 5: Documentation (Day 9)

### Step 5.1: Plugin Development Guide

Create `docs/PLUGIN_DEVELOPMENT.md` with:
- How to create a new game plugin
- Required configuration schema
- Example plugin templates
- Testing guidelines

### Step 5.2: Migration Guide

Create `docs/MIGRATION_GUIDE.md` with:
- Breaking changes
- How to update existing code
- Common migration patterns

---

## ?렞 Success Criteria

### Phase 1 Complete When:
- [ ] Core engine extracted to `src/core/`
- [ ] Synthesis logic is game-agnostic
- [ ] Calculator is game-agnostic
- [ ] Unit tests pass

### Phase 2 Complete When:
- [ ] WW plugin created in `src/games/wutheringwave/`
- [ ] All WW data moved to plugin
- [ ] Plugin config complete
- [ ] Plugin loads successfully

### Phase 3 Complete When:
- [ ] Game registry implemented
- [ ] Can switch between games (even with just WW)
- [ ] LocalStorage saves current game
- [ ] Views use game registry

### Phase 4 Complete When:
- [ ] All tests pass
- [ ] Comparison tests show identical results
- [ ] No regressions found

### Phase 5 Complete When:
- [ ] Documentation complete
- [ ] Example plugin created
- [ ] Migration guide written

---

## ?슚 Risk Mitigation

### Keep Old Code During Migration
- Don't delete old files immediately
- Use feature flags to switch between old/new systems
- Run both systems in parallel during testing

### Incremental Migration
- Migrate one view at a time
- Start with least critical features
- Use adapter pattern if needed

### Rollback Plan
- Git branch for refactoring
- Easy revert if issues found
- Deploy to staging first

---

## ?뱟 Timeline

**Week 1:**
- Days 1-2: Phase 1 (Core Extraction)
- Days 3-5: Phase 2 (WW Plugin)

**Week 2:**
- Days 6-7: Phase 3 (Game Registry)
- Day 8: Phase 4 (Testing)
- Day 9: Phase 5 (Documentation)

**Total:** 9 working days (~2 weeks)

---

## Next Steps

1. ??Review this refactoring plan
2. ??Approve/modify approach
3. ??Start Phase 1: Core Extraction
4. ??Create feature branch: `git checkout -b refactor/multi-game-support`
5. ??Begin implementation!

