# Plugin Development Quick Reference

**Full guide:** See `CLAUDE.md` → "Adding a New Game (Plugin Development)"

---

## Checklist

### 1. Create Folder Structure
```
src/games/{gameid}/
├── index.js
├── config.js
├── materialProcessor.js
├── components/CharacterDialog.vue
└── data/ (character.json, weapon.json, materials.json, costs.json, tiers.js)
```

### 2. Required Files
- [ ] `data/character.json` - Character metadata
- [ ] `data/weapon.json` - Weapon metadata
- [ ] `data/materials.json` - Material catalog
- [ ] `data/costs.json` - Leveling costs
- [ ] `data/tiers.js` - Tiered material definitions
- [ ] `materialProcessor.js` - `{ SUPPORTED_KEYS, processMaterial }`
- [ ] `config.js` - Theme colors, constants, form fields
- [ ] `index.js` - Plugin export
- [ ] `components/CharacterDialog.vue`

### 3. Register Plugin
```javascript
// src/main.js
import newgamePlugin from './games/newgame';
gameStore.registerGame(newgamePlugin);
```

### 4. Add Tests
```
tests/games/{gameid}-materialProcessor.test.js
```

---

## EXP Category (Dynamic Detection)

**Important:** Categories with `value` field are automatically detected as EXP types.

```json
// materials.json
{
  "player_exp": {
    "potion_s": { "game_id": "123", "value": 200, ... }
  },
  "weapon_exp": {
    "core_s": { "game_id": "456", "value": 200, ... }
  },
  "skill_exp": {
    "book_s": { "game_id": "789", "value": 500, ... }
  }
}
```

- **No code changes required** when adding new EXP categories
- Just add `value` field to materials → automatically handled
- See `CLAUDE.md` → "Dynamic EXP Category System" for details

---

## Material Card UI (Automatic)

FinalMaterialNeeds displays materials with a simplified card UI. **No code changes required** for new games.

### Display Rules (Automatic)
| Feature | Behavior | Data Requirement |
|---------|----------|------------------|
| Card display | Shows need number only (Required - Owned - Synthesis) | Standard fields |
| Complete hiding | Hides cards when need ≤ 0 | `need`, `owned`, `synthesize` |
| Tiered dialog | Groups items with multiple unique tiers | `tier` field |
| EXP dialog | Shows all EXP items in category | `value` field |
| Sort order | Ascending by tier or value | `tier` or `value` |

### Tiered Lineup Detection
Items are grouped in dialog only when:
1. Multiple items in subcategory
2. Multiple unique tier values exist

```
✅ bolete (T1, T2, T3, T4) → Grouped dialog
❌ special (all T4) → Individual dialogs
```

### Required Fields for UI

```json
// Tiered material (for grouped dialog)
{ "tier": 1 }, { "tier": 2 }, { "tier": 3 }

// EXP material (for EXP dialog)
{ "value": 200 }, { "value": 1000 }
```

See `CLAUDE.md` → "FinalMaterialNeeds UI System" for details.

---

## Reference Implementations
- **WutheringWaves**: `src/games/wutheringwave/` (simple)
- **Endfield**: `src/games/endfield/` (complex)

## Data Reference
- `LocalOnly/Endfield/` - DATA_STRUCTURE, GOOGLE_SHEETS_GUIDE, ID_SYSTEM
- `LocalOnly/WutheringWaves/` - GOOGLE_SHEETS_GUIDE, ID_SYSTEM
