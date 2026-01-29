# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Multi-Game Planner** - A Vue 3 application supporting multiple games (WutheringWaves, Endfield) for planning character/weapon progression, calculating required materials, tracking inventory, and optimizing material synthesis.

## Development Commands

```bash
npm run dev       # Start dev server on http://localhost:3000 (auto-opens browser)
npm run build     # Build for production to dist/
npm run preview   # Preview production build locally
npm run test      # Run tests in watch mode
npm run test:run  # Run tests once
```

---

## Architecture

### Tech Stack
- **Vue 3.5** with Composition API (`<script setup>`)
- **Pinia** for state management
- **Vue Router 4** for routing
- **Vite 6** for build tooling
- **Vitest** for testing
- **localStorage** for data persistence

### Project Structure
```
src/
├── games/                    # Game plugins
│   ├── wutheringwave/        # WutheringWaves plugin
│   │   ├── index.js          # Plugin entry
│   │   ├── config.js         # Game config
│   │   ├── materialProcessor.js  # Material processing
│   │   ├── components/       # Game-specific components
│   │   └── data/             # Game data files
│   └── endfield/             # Endfield plugin (same structure)
├── services/
│   └── materialHelper/       # Core material calculation
│       ├── core.js           # Dynamic dispatch to game processors
│       ├── character.js      # Character material calc
│       ├── weapon.js         # Weapon material calc
│       ├── synthesis.js      # Synthesis logic
│       └── dbUtils.js        # Database utilities
├── store/
│   ├── game.js               # Game selection & plugin management
│   ├── planner.js            # Planning state (goals, settings)
│   └── inventory.js          # Inventory state
├── views/                    # Route views
├── components/               # Shared components
└── utils/                    # Utilities (logger, storage, errorHandler)
```

### Core Routes
- `/` - HomeView (game selection, initialization)
- `/planner` - PlannerView (goal management, final material display)
- `/character` - CharacterView (character selection/configuration)
- `/weapon` - WeaponView (weapon selection/configuration)
- `/inventory` - InventoryView (material inventory management)

---

## Multi-Game Plugin System

### Plugin Interface

Each game plugin must export:

```javascript
const gamePlugin = {
  // Required
  id: 'gameid',                    // Unique identifier
  name: 'Game Name',               // Display name
  displayName: 'Game Name',
  config: { ... },                 // Game configuration
  materialProcessor: {             // Material processing
    SUPPORTED_KEYS: [...],
    processMaterial: (materials, key, value, characterInfo) => boolean
  },
  getData(type) { ... },           // Returns cached data by type

  // Optional
  components: { CharacterDialog }, // Game-specific Vue components
  install() { ... },               // Called when game selected
  uninstall() { ... },             // Called when switching away
};
```

### Game Store (`src/store/game.js`)

```javascript
const gameStore = useGameStore();
gameStore.registerGame(plugin);    // Register plugin
gameStore.setCurrentGame('gameid'); // Switch game
gameStore.currentGame;             // Current plugin
gameStore.currentGameId;           // Current game ID
```

### Material Processing Flow

```
costs.json: { "common": [5, 2] }
       ↓
core.js: processMaterials()
       ↓
gameStore.currentGame.materialProcessor.processMaterial()
       ↓
Game-specific resolution (WW: SubCategory lookup, Endfield: different keys)
       ↓
{ game_id: quantity }
```

---

## Adding a New Game (Plugin Development)

### Step 1: Create Folder Structure

```
src/games/newgame/
├── index.js              # Plugin entry point
├── config.js             # Game configuration
├── materialProcessor.js  # Material processing logic
├── components/
│   └── CharacterDialog.vue
└── data/
    ├── index.js          # Data exports
    ├── character.json
    ├── weapon.json
    ├── materials.json
    ├── costs.json
    └── tiers.js
```

### Step 2: Create Data Files

**character.json:**
```json
{
  "char_001": {
    "game_id": "char_001",
    "display_name": "Character Name",
    "rarity": 5,
    "element": "fire",
    "weapon_type": "sword",
    "icon": "/path/to/icon.png",
    "common": "material_subcategory",
    "forgery": "skill_subcategory",
    "ascension": "game_id_of_ascension_material",
    "boss": "game_id_of_boss_material"
  }
}
```

**materials.json:**
```json
{
  "credit": { ... },
  "common": {
    "mat_001": {
      "game_id": "mat_001",
      "label": "Material Name",
      "icon": "/path/to/icon.png",
      "Category": "common",
      "SubCategory": "material_type",
      "tier": 1
    }
  },
  "forgery": { ... },
  "ascension": { ... },
  "boss": { ... },
  "player_exp": {
    "exp_001": {
      "game_id": "exp_001",
      "label": "EXP Potion S",
      "icon": "/path/to/icon.png",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 2,
      "value": 200
    }
  },
  "weapon_exp": { ... }
}
```

**Note:** Categories with `value` field are automatically detected as EXP categories. See [Dynamic EXP Category System](#dynamic-exp-category-system).

**costs.json:**
```json
{
  "character": {
    "level": {
      "20": { "common": [5, 1], "credit": 5000 },
      "20A": { "common": [10, 2], "ascension": 1, "credit": 10000 }
    },
    "skill": {
      "2": { "forgery": [3, 1], "credit": 2000 }
    }
  },
  "weapon": { "level": { ... } }
}
```

**Format:** Tiered materials use `[quantity, tier]`, direct materials use `quantity`

### Step 3: Create materialProcessor.js

```javascript
import { findMaterial, getMaterialField } from '@/services/materialHelper/dbUtils';

export const SUPPORTED_KEYS = [
  'common', 'forgery',     // Tiered by SubCategory
  'ascension', 'boss',     // Direct game_id
];

export const processMaterial = (materials, key, value, characterInfo) => {
  // Tiered materials
  if (['common', 'forgery'].includes(key)) {
    const [qty, tier] = value;
    const subCategory = characterInfo[key];
    const material = findMaterial(key, subCategory, tier);
    if (material) {
      const gameId = getMaterialField(material, 'game_id');
      if (gameId) materials[gameId] = (materials[gameId] || 0) + qty;
    }
    return true;
  }

  // Direct game_id materials
  if (['ascension', 'boss'].includes(key)) {
    const gameId = characterInfo[key];
    if (gameId) materials[gameId] = (materials[gameId] || 0) + value;
    return true;
  }

  return false; // Not handled
};

export default { SUPPORTED_KEYS, processMaterial };
```

### Step 4: Create config.js

```javascript
export default {
  id: 'newgame',
  name: 'New Game',
  displayName: 'New Game',

  themeColors: {
    rarity: { 3: '#3b82f680', 4: '#6B60B5', 5: '#C88844' },
    element: { fire: '#FF6347', water: '#00BFFF' },
  },

  constants: {
    MAX_LEVEL: 90,
    MAX_SKILL_LEVEL: 10,
    SYNTHESIS_RATIO: 3,
  },

  filters: {
    elements: [{ value: 'all', label: 'All' }, ...],
    weaponTypes: [...],
  },

  formFields: {
    characterLevelItems: [
      { value: '1', label: 'Level 1' },
      { value: '20', label: 'Level 20' },
      { value: '20A', label: 'Level 20 Ascended' },
    ],
  },

  stamina: {
    name: 'Stamina',
    dailyLimit: 240,
    farmingRates: { credit: { drops: 30000, stamina: 40 } },
  },

  createCharacterInitialSettings() {
    return { currentLevel: '1', targetLevel: '1', activeSkills: {}, passiveSkills: {} };
  },
};
```

### Step 5: Create index.js (Plugin Entry)

```javascript
import config from './config.js';
import * as materialProcessor from './materialProcessor.js';
import CharacterDialog from './components/CharacterDialog.vue';
import characters from './data/character.json';
import weapons from './data/weapon.json';
import materials from './data/materials.json';
import costs from './data/costs.json';
import { tieredMaterials } from './data/tiers.js';

const dataCache = { characters, weapons, materials, costs, tiers: tieredMaterials };

const newgamePlugin = {
  id: config.id,
  name: config.name,
  displayName: config.displayName,
  version: '1.0.0',
  config,
  materialProcessor,
  components: { CharacterDialog },
  async install() { return Promise.resolve(); },
  async uninstall() { return Promise.resolve(); },
  getData(type) { return dataCache[type] ?? null; },
};

export default newgamePlugin;
```

### Step 6: Register Plugin

In `src/main.js`:
```javascript
import newgamePlugin from './games/newgame';
import { useGameStore } from './store/game';

const gameStore = useGameStore();
gameStore.registerGame(newgamePlugin);
```

### Step 7: Create CharacterDialog Component

Copy from existing game and modify:
- `src/games/wutheringwave/components/CharacterDialog.vue` (simpler)
- `src/games/endfield/components/CharacterDialog.vue` (complex skills)

Required props: `visible`, `character`, `settings`, `levelItems`
Required emits: `close`, `updateCharacter`

### Step 8: Add Tests

Create `tests/games/newgame-materialProcessor.test.js`:
```javascript
import { describe, it, expect, vi } from 'vitest';
import { processMaterial, SUPPORTED_KEYS } from '@/games/newgame/materialProcessor';

vi.mock('@/services/materialHelper/dbUtils', () => ({
  findMaterial: vi.fn(() => ({ game_id: 'mock_id' })),
  getMaterialField: vi.fn((m, f) => m?.[f] || null),
}));

describe('NewGame MaterialProcessor', () => {
  it('should support expected keys', () => {
    expect(SUPPORTED_KEYS).toContain('common');
  });
});
```

### Reference Implementations
- **WutheringWaves**: `src/games/wutheringwave/` - Simpler skill system
- **Endfield**: `src/games/endfield/` - Complex skill + dungeon system

---

## State Management (Pinia Stores)

### planner.js
- `goals[]` - Array of character/weapon goals with calculated materials
- `characterSettings{}` - Per-character level/skill configurations
- `weaponSettings{}` - Per-weapon level configurations
- Storage keys: `wwplanner_goals_${gameId}`, `wwplanner_character_${gameId}`, `wwplanner_weapon_${gameId}`

### inventory.js
- `inventory{}` - Material quantities indexed by game_id
- `currentGameId` - Set via `hydrate(gameId)`
- Storage key: `wwplanner_inventory_${gameId}`
- Actions: `addMaterial()`, `removeMaterial()`, `saveInventory()`, `loadInventory()`, `hydrate()`

### game.js
- `registeredGames{}` - All registered game plugins
- `currentGameId` - Currently selected game
- `currentGame` - Current game plugin (computed)

---

## Material Calculation System

### Data Flow
```
User Settings (CharacterDialog/WeaponDialog)
  ↓
plannerStore.updateCharacterSettings()
  ↓
calculateCharacterMaterials() / calculateWeaponMaterials()
  ↓
processMaterials() [delegates to game-specific processor]
  ↓
mergeMaterials() [combines level + skill + passive materials]
  ↓
performItemSynthesisWithNeeds() [forward synthesis]
  ↓
backwardConversion() [surplus high-tier → low-tier]
  ↓
FinalMaterialNeeds.vue displays results
```

### Material Resolution Patterns

**Tiered Materials** (common, forgery):
- Store with `tier` field in materials.json
- Use `[quantity, tier]` format in costs.json
- Use `findMaterial(category, subCategory, tier)` to look up

**Direct Game ID Materials** (ascension, boss):
- Store game_id in character data
- Use `quantity` format in costs.json
- Use `findMaterial(category, gameId, null, true)` to look up

---

## Dynamic EXP Category System

The planner automatically detects EXP-type categories from `materials.json`. **No code changes required** when adding new EXP categories.

### Detection Rule
Any category where items have a `value` field (number) is treated as an EXP category:
```json
{
  "player_exp": {
    "potion_s": { "game_id": "123", "value": 200, ... },
    "potion_m": { "game_id": "124", "value": 1000, ... }
  },
  "weapon_exp": {
    "core_s": { "game_id": "456", "value": 200, ... }
  },
  "skill_exp": {
    "book_s": { "game_id": "789", "value": 500, ... }
  }
}
```

### Supported Features (Automatic)
- **Planner display**: Shows as single category with total EXP needed
- **Inventory tracking**: Individual item quantities tracked
- **Complete badge**: Shows when total owned EXP >= required EXP
- **Goal completion**: Deducts from highest-value items first
- **Estimated runs**: Calculates farming runs based on stamina config

### Adding New EXP Category
1. Add category to `materials.json` with `value` field on each item:
```json
{
  "skill_exp": {
    "book_001": {
      "game_id": "skill_book_001",
      "label": "Skill Book S",
      "icon": "...",
      "Category": "skill_exp",
      "SubCategory": "skill_exp",
      "tier": 2,
      "value": 500
    }
  }
}
```

2. Add to `config.js` stamina farmingRates (for Estimated calculations):
```javascript
stamina: {
  farmingRates: {
    skill_exp: { drops: 5000, stamina: 40 }
  }
}
```

3. Use in `costs.json`:
```json
{
  "character": {
    "skill": {
      "2": { "skill_exp": 1000 }
    }
  }
}
```

**That's it!** The planner will automatically handle the new EXP category.

---

## FinalMaterialNeeds UI System

The planner displays required materials with a simplified card UI and detailed dialog. **No code changes required** for new games - all features work automatically based on data structure.

### Material Card Display

Cards show only the **need number** (required - owned - synthesis). Clicking opens ItemDialog.

```
┌─────────────┐
│   [icon]    │
│     123     │  ← Need number only (red color)
└─────────────┘
```

**Features (Automatic):**
- Cards are clickable → opens ItemDialog
- Complete items are hidden (`v-show="!isTaskComplete(task)"`)
- Items sorted by tier ascending (T1, T2, T3, T4)

### ItemDialog Component

`src/components/planner/ItemDialog.vue` - Shared component for all games.

**Single Item Display:**
- Required, Owned, Synthesis, Need values
- Inventory input at bottom

**Tiered Lineup Display:**
- All tiers shown in one dialog (T1, T2, T3, T4)
- Each tier has individual inventory input
- Complete tiers shown with reduced opacity

**EXP Category Display:**
- All EXP items shown (sorted by value ascending)
- Each item shows EXP value
- Individual inventory input per item

### Tiered Lineup Detection (Game-Agnostic)

Tiered lineups are detected automatically based on data:

```javascript
// Detection logic in openItemDialog()
const tiers = subCategory.task.map(t => t.tier).filter(t => t !== undefined && t !== null);
const uniqueTiers = new Set(tiers);
const isTieredLineup = tiers.length > 1 && uniqueTiers.size > 1;
```

**Conditions for tiered lineup:**
1. Multiple items in subcategory (`tiers.length > 1`)
2. Multiple unique tier values (`uniqueTiers.size > 1`)

**Examples:**
- `bolete` (T1, T2, T3, T4) → Tiered lineup → Show all in one dialog
- `special` (all T4) → NOT tiered → Show each individually

### Data Requirements for UI Features

| Feature | Required Field | Example |
|---------|---------------|---------|
| Tiered display | `tier` | `"tier": 2` |
| EXP display | `value` | `"value": 1000` |
| Complete detection | `need`, `owned`, `synthesize` | Calculated at runtime |
| Sort order | `tier` or `value` | Ascending (low to high) |

### Adding Materials (No Code Changes Needed)

1. **Tiered materials**: Add `tier` field to materials.json
   ```json
   { "tier": 1 }, { "tier": 2 }, { "tier": 3 }, { "tier": 4 }
   ```

2. **EXP materials**: Add `value` field to materials.json
   ```json
   { "value": 200 }, { "value": 1000 }, { "value": 5000 }
   ```

3. **Single items**: No special fields needed

---

## Utilities

**logger.js** - Environment-aware logging
```javascript
import logger from '@/utils/logger';
logger.debug('Message');  // Only in development
logger.error('Message');  // Always logged
```

**errorHandler.js** - Global error handling
```javascript
import errorHandler from '@/utils/errorHandler';
errorHandler.handle(error, 'contextName');
```

**storage.js** - localStorage wrapper
```javascript
import { storage } from '@/utils/storage';
storage.get(key);
storage.set(key, value);
storage.backup();
storage.restore(backupData);
```

---

## Styling Conventions

### Gradient System
Characters/weapons use rarity + element gradients from game config:
```javascript
const gradient = computed(() => {
  const colors = currentGame.config.themeColors;
  return `linear-gradient(180deg, ${colors.rarity[rarity]} 40%, ${colors.element[element]} 59%)`;
});
```

---

## Known Patterns

### Level Format
Character/weapon levels use string format with "A" suffix for ascension:
- Pre-ascension: `"1"`, `"20"`, `"40"`, `"60"`, `"70"`, `"80"`
- Post-ascension: `"20A"`, `"40A"`, `"60A"`, `"70A"`, `"80A"`, `"90"`

### Material Tiers (WutheringWaves)
Tier 1 (LF) → Tier 2 (MF) → Tier 3 (HF) → Tier 4 (FF)
Synthesis ratio: 3:1

---

## File Naming Conventions

- Views: `PascalCase.vue` (e.g., `CharacterView.vue`)
- Components: `PascalCase.vue` (e.g., `CharacterDialog.vue`)
- Stores: `camelCase.js` (e.g., `planner.js`)
- Services: `camelCase.js` (e.g., `characterHelper.js`)
- Utils: `camelCase.js` (e.g., `logger.js`)
- Data: `camelCase.json` or `camelCase.js`
- Game plugins: `src/games/{gameid}/`

---

## Troubleshooting

### Materials not calculating
1. Check SUPPORTED_KEYS includes your material key
2. Check processMaterial returns true for handled keys
3. Check materials.json has correct Category/SubCategory
4. Check costs.json format matches expected ([qty, tier] vs qty)

### Plugin not loading
1. Check plugin is registered in main.js
2. Check getData returns correct data types
3. Check console for import errors

### UI not rendering
1. Check config.formFields has required items
2. Check CharacterDialog emits correct events
3. Check translations exist in locales

---

## Path Alias

Vite configured with `@` alias pointing to `src/`:
```javascript
import logger from '@/utils/logger';
import { usePlannerStore } from '@/store/planner';
import costs from '@/data/costs.json';
```
