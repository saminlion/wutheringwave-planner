# Refactoring Plan: Multi-Game Support

## Current Status (2026-01-26)

### Completed Phases

#### Phase 1: ID Prefix Hardcoding Removal [DONE]
- **Commit:** `05e4c7e` - refactor: Remove WW-specific hardcoded IDs from PlannerView
- Removed `startsWith("42")` / `startsWith("43")` checks
- Now uses `goal.type === 'character'` / `goal.type === 'weapon'`
- Removed hardcoded player_exp material IDs (41601001-41601004)
- Removed hardcoded weapon_exp material IDs (41701001-41701004)
- Created dynamic computed properties from gameStore:
  - `playerExpMaterials`
  - `weaponExpMaterials`
  - `expMaterialTypeStructure`

#### Phase 2: localStorage Prefix Change [DONE]
- **Commit:** `1a8e319` - refactor: Rename wwplanner localStorage prefix to gameplanner
- Changed `wwplanner` → `gameplanner` in:
  - `src/utils/storage.js`
  - `src/store/planner.js`
  - `src/store/inventory.js`
  - `src/store/gameRegistry.js`
  - `src/store/userProfile.js`
  - `src/store/game.js`
  - `src/components/common/DataBackup.vue`

---

#### Phase 3: Endfield Conditionals Extraction [DONE]
- Added `uiHandlers` to both game configs
- WW config: `showDungeonLevelSelector: false`, `useDynamicFarmingRates: false`
- Endfield config: `showDungeonLevelSelector: true`, `useDynamicFarmingRates: true`, `useTierSeparatedEstimates()`
- Replaced all `isEndfield` checks in FinalMaterialNeeds.vue with config-based handlers:
  - `showDungeonLevelSelector` - Whether to show dungeon level selector
  - `useDynamicFarmingRates` - Whether to use dynamic farming rates
  - `useTierSeparatedEstimates(category)` - Whether to show tier-separated estimates
- Renamed functions to be game-agnostic:
  - `getEndfieldDungeonData` → `getDungeonDataForCategory`
  - `getEndfieldForgeryEstimates` → `getTierSeparatedForgeryEstimates`

---

## Remaining Bugs (from FEATURE_TODO)

### Bug: Deactivate (Eye Icon) Issues
1. After navigating away and back, deactivated items show as active (visual only - actually still deactivated)
2. Estimated Planner section doesn't update when items are deactivated - only updates after page navigation

**Files to investigate:**
- `src/views/PlannerView.vue`
- `src/store/planner.js`
- Goal deactivation state persistence

---

## Future Refactoring (When 3rd Game Added)

### Game-Specific Handler Pattern
```javascript
// In game config
export const gameConfig = {
  // ... other config

  uiHandlers: {
    shouldShowDungeonLevel(category) {
      // Endfield: only for forgery
      return category.name === 'forgery';
    },

    getDungeonLevelOptions() {
      return [1, 2, 3, 4, 5];
    },

    // Other game-specific UI logic
  }
};
```

### Component Usage
```javascript
// Instead of:
v-if="isEndfield && category.name === 'forgery'"

// Use:
v-if="gameConfig.uiHandlers?.shouldShowDungeonLevel?.(category)"
```

---

## Architecture Reference

### Current Game Plugin Structure
```
src/games/
├── wutheringwave/
│   ├── config.js       # Game configuration
│   ├── data/
│   │   ├── index.js    # Data exports
│   │   └── *.json      # Game data files
│   └── index.js        # Plugin entry
└── endfield/
    ├── config.js
    ├── data/
    └── index.js
```

### Key Stores
- `gameRegistry.js` - Manages game plugins, current game state
- `game.js` - Provides game data access (`useGameStore`)
- `planner.js` - Goal management, material calculations
- `inventory.js` - Material inventory
- `userProfile.js` - User preferences (dungeon levels, etc.)

---

## Testing Checklist

After refactoring changes, verify:
- [ ] WW characters can be added/edited/removed
- [ ] WW weapons can be added/edited/removed
- [ ] Endfield characters can be added/edited/removed
- [ ] Endfield weapons can be added/edited/removed
- [ ] Material calculations are correct for both games
- [ ] Deactivate (eye icon) works correctly
- [ ] Data persists after page refresh
- [ ] Game switching works correctly
