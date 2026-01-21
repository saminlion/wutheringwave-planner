# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wuthering Waves Game Planner** - A Vue 3 application that helps players plan character/weapon progression by calculating required materials, tracking inventory, and optimizing material synthesis.

## Development Commands

```bash
npm run dev      # Start dev server on http://localhost:3000 (auto-opens browser)
npm run build    # Build for production to dist/
npm run preview  # Preview production build locally
```

## Architecture

### Tech Stack
- **Vue 3.5** with Composition API (`<script setup>`)
- **Pinia** for state management
- **Vue Router 4** for routing
- **Vite 6** for build tooling
- **localStorage** for data persistence

### Core Routes
- `/` - HomeView (game selection, initialization)
- `/planner` - PlannerView (goal management, final material display)
- `/character` - CharacterView (character selection/configuration)
- `/weapon` - WeaponView (weapon selection/configuration)
- `/inventory` - InventoryView (material inventory management)

### State Management (Pinia Stores)

**`src/store/planner.js`** - Main planning state
- `goals[]` - Array of character/weapon goals with calculated materials
- `characterSettings{}` - Per-character level/skill configurations
- `weaponSettings{}` - Per-weapon level configurations
- `currentGameId` - Currently 'wutheringwave' (hardcoded)
- Storage keys: `wwplanner_goals_${gameId}`, `wwplanner_character_${gameId}`, `wwplanner_weapon_${gameId}`

**`src/store/inventory.js`** - Player inventory state
- `inventory{}` - Material quantities indexed by game_id
- `currentGameId` - Set via `hydrate(gameId)`
- Storage key: `wwplanner_inventory_${gameId}`
- Actions: `addMaterial()`, `removeMaterial()`, `saveInventory()`, `loadInventory()`, `hydrate()`

### Data Persistence Pattern

All stores use localStorage with per-game keys:
```javascript
// Initialization in HomeView.vue
onMounted(() => {
  plannerStore.hydrate();                           // Uses planner.currentGameId
  inventoryStore.hydrate('wutheringwave');         // Requires explicit gameId
});
```

**Important:** When adding new views that use inventory/planner data, ensure stores are hydrated before component mount.

## Material Calculation System

The heart of this application. Multi-stage process:

### Data Flow
```
User Settings (CharacterDialog/WeaponDialog)
  ↓
plannerStore.updateCharacterSettings()
  ↓
calculateCharacterMaterials() / calculateWeaponMaterials()
  ↓
processMaterials() [resolves tier lookups via character metadata]
  ↓
mergeMaterials() [combines level + skill + passive materials]
  ↓
performItemSynthesisWithNeeds() [forward synthesis 3:1]
  ↓
backwardConversion() [surplus high-tier → low-tier]
  ↓
FinalMaterialNeeds.vue displays results
```

### Key Files

**`src/services/materialHelper/`** - Material calculation engine
- `character.js` - Character material calculations (level, skills, passives)
- `weapon.js` - Weapon material calculations (level only)
- `core.js` - Material processing and tier lookup resolution
- `synthesis.js` - Forward/backward synthesis logic
- `plannerCalc.js` - Material merging and level range extraction
- `dbUtils.js` - Database lookup utilities

**`src/data/costs.json`** - Critical file (~200KB)
- Contains ALL leveling costs for characters/weapons
- Structure: `character.level["20A"]`, `character.skill["5"]`, `character.passive.skill["2"]`
- Format: `{ common: [quantity, tier], credit: amount, ... }`
- Material fields: `common`, `forgery`, `ascension`, `boss`, `weeklyBoss`, `credit`

**`src/data/tieredMaterials.js`** - Synthesis definitions
- Defines 4-tier progression for craftable materials
- Ratio: 3 of tier N → 1 of tier N+1
- Categories: common materials, forgery materials

### Material Resolution Pattern

Materials use indirect references that must be resolved:
```javascript
// Example from costs.json
{ common: [4, 2] }  // Need 4 items of tier 2

// Resolution in processMaterials()
1. Look up character.common field → e.g., "whisperin_core"
2. Find material in inventoryItem.json where SubCategory === "whisperin_core" AND tier === 2
3. Extract game_id → e.g., 41101002
4. Store quantity: { 41101002: 4 }
```

### Character Settings Structure

```javascript
{
  characterId: {
    currentLevel: "1",           // "1", "20", "20A", "40", "40A", ..., "90"
    targetLevel: "90",
    activeSkills: {
      primary_attack: { current: 1, target: 10 },
      special_ability: { current: 1, target: 10 },
      ultimate_move: { current: 1, target: 10 },
      support_skill: { current: 1, target: 10 },
      enhanced_mode: { current: 1, target: 10 }
    },
    passiveSkills: {
      passive_ability_1: false,       // Tier 1
      bonus_stats_1_1: false,
      bonus_stats_1_2: false,
      bonus_stats_1_3: false,
      bonus_stats_1_4: false,
      passive_ability_2: false,       // Tier 2
      bonus_stats_2_1: false,
      bonus_stats_2_2: false,
      bonus_stats_2_3: false,
      bonus_stats_2_4: false
    }
  }
}
```

## Important Data Files

**`src/data/character.json`** - Character metadata (~50KB)
- 15+ characters with full progression data
- Each entry includes: `game_id`, `name`, `element`, `weapon`, `rarity`
- Material references: `common`, `ascension`, `boss`, `weeklyBoss` (SubCategory names)
- Icon URLs for character portraits

**`src/data/weapon.json`** - Weapon metadata (~30KB)
- 50+ weapons grouped by rarity (3★, 4★, 5★)
- Each entry includes: `game_id`, `name`, `type`, `rarity`
- Material references: `common`, `ascension` (SubCategory names)

**`src/data/inventoryItem.json`** - Material catalog (~150KB)
- 250+ materials with icons, labels, categories
- Structure: `{ category: { subcategory: { game_id, icon, label, Category, SubCategory, rarity } } }`
- Categories: credit, common, forgery, ascension, boss, weeklyBoss, player_exp, weapon_exp

## Component Patterns

### Dialog Components
Both `CharacterDialog.vue` and `WeaponDialog.vue` follow this pattern:
```vue
<script setup>
const props = defineProps(['modelValue', 'character/weapon']);
const emit = defineEmits(['update:modelValue', 'save']);

// Load settings from plannerStore
const settings = ref({ ...defaultSettings, ...storedSettings });

const saveSettings = () => {
  plannerStore.updateCharacterSettings(id, settings.value);
  emit('save');
  close();
};
</script>
```

### Inventory Sync Pattern
`InventoryView.vue` uses local `quantities` ref synced with store:
```vue
const quantities = ref(materials.reduce(...));

// Watch for store changes
watch(inventory, (newInventory) => {
  materials.forEach(material => {
    quantities.value[material.game_id] = newInventory[material.game_id] || 0;
  });
}, { deep: true });

// Sync on mount
onMounted(() => {
  materials.forEach(material => {
    quantities.value[material.game_id] = inventory.value[material.game_id] || 0;
  });
});
```

**Critical:** When updating quantities, use separate functions for add/remove:
- `debouncedAddMaterial()` → `inventoryStore.addMaterial()`
- `debouncedRemoveMaterial()` → `inventoryStore.removeMaterial()`

Do NOT use `addMaterial()` for both operations (this was a previous bug).

## Utilities

**`src/utils/logger.js`** - Environment-aware logging
```javascript
import logger from '@/utils/logger';
logger.debug('Message');  // Only in development
logger.error('Message');  // Always logged
```

**`src/utils/errorHandler.js`** - Global error handling
```javascript
import errorHandler from '@/utils/errorHandler';
errorHandler.handle(error, 'contextName');
```

**`src/utils/storage.js`** - localStorage wrapper
```javascript
import { storage } from '@/utils/storage';
storage.get(key);
storage.set(key, value);
storage.backup();
storage.restore(backupData);
```

## Path Alias

Vite configured with `@` alias pointing to `src/`:
```javascript
import logger from '@/utils/logger';              // ✓
import { usePlannerStore } from '@/store/planner'; // ✓
import costs from '@/data/costs.json';             // ✓
```

## Styling Conventions

### Gradient System
Characters/weapons use rarity + element gradients:
```javascript
const gradient = computed(() => {
  const rarityColors = {
    3: '#3b82f680',
    4: '#6B60B5',
    5: '#C88844'
  };
  const elementColors = {
    glacio: '#00BFFF',
    fusion: '#FF6347',
    electro: '#9370DB',
    // ... etc
  };
  return `linear-gradient(180deg, ${rarityColors[rarity]} 40%, ${elementColors[element]} 59%)`;
});
```

### Category Display Order
Materials displayed in this order:
1. credit (Shell Credits)
2. common (Ascension materials - tiered)
3. forgery (Skill materials - tiered)
4. ascension (Character-specific)
5. boss (World boss drops)
6. weeklyBoss (Weekly boss drops)
7. player_exp (Player experience)
8. weapon_exp (Weapon experience)

## Common Tasks

### Adding a New Character
1. Add entry to `src/data/character.json`
2. Ensure material references match `inventoryItem.json` SubCategory names
3. Add leveling costs to `costs.json` if unique progression exists
4. Icon URL should point to CDN/assets

### Adding a New Material
1. Add to `src/data/inventoryItem.json` under appropriate category
2. If tiered (common/forgery), add to `src/data/tieredMaterials.js`
3. Ensure `game_id` is unique
4. Add costs to `costs.json` where material is consumed

### Debugging Material Calculations
1. Check browser console for logger.debug() output (dev mode only)
2. Use Vue DevTools to inspect `plannerStore.goals[].materials`
3. Verify character metadata has correct material SubCategory references
4. Check `costs.json` has entries for the level/skill range
5. Test synthesis logic with different inventory quantities

### Fixing Inventory Sync Issues
Common issue: `quantities` ref not syncing with store
- Ensure `watch(inventory, ...)` is set up with `{ deep: true }`
- Call sync in `onMounted()`
- Verify `inventoryStore.hydrate(gameId)` called before component mounts

## Known Patterns

### Level Format
Character/weapon levels use string format with "A" suffix for ascension:
- Pre-ascension: `"1"`, `"20"`, `"40"`, `"60"`, `"70"`, `"80"`
- Post-ascension: `"20A"`, `"40A"`, `"60A"`, `"70A"`, `"80A"`, `"90"`

### Skill Levels
Active skills: 1-10 (integers)
Passive skills: boolean (unlocked or not)

### Material Tiers
Tier 1 (LF) → Tier 2 (MF) → Tier 3 (HF) → Tier 4 (FF)
Prefix indicates rarity: Low Frequency, Medium Frequency, High Frequency, Full Frequency

## File Naming Conventions

- Views: `PascalCase.vue` (e.g., `CharacterView.vue`)
- Components: `PascalCase.vue` (e.g., `CharacterDialog.vue`)
- Stores: `camelCase.js` (e.g., `planner.js`)
- Services: `camelCase.js` (e.g., `characterHelper.js`)
- Utils: `camelCase.js` (e.g., `logger.js`)
- Data: `camelCase.json` or `camelCase.js` (e.g., `costs.json`, `tieredMaterials.js`)

## Testing in Browser

After changes:
1. Check browser console for errors (no suppressions)
2. Verify localStorage updates in DevTools > Application > Local Storage
3. Test new character → edit → save → refresh → verify settings persist
4. Test inventory change → refresh → verify quantity persists
5. Verify material calculations in PlannerView match expected costs

## Recent Changes (Phase 1)

The codebase recently underwent Phase 1 improvements:
- Centralized logging system (`src/utils/logger.js`)
- Global error handling (`src/utils/errorHandler.js`)
- Loading states (`src/composables/useLoading.js`, `LoadingSpinner.vue`)
- Data backup/restore UI (`DataBackup.vue`)
- LocalStorage utilities (`src/utils/storage.js`)

See `PHASE1_COMPLETE.md` for details.
