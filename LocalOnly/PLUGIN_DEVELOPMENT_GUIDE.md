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

## Reference Implementations
- **WutheringWaves**: `src/games/wutheringwave/` (simple)
- **Endfield**: `src/games/endfield/` (complex)

## Data Reference
- `LocalOnly/Endfield/` - DATA_STRUCTURE, GOOGLE_SHEETS_GUIDE, ID_SYSTEM
- `LocalOnly/WutheringWaves/` - GOOGLE_SHEETS_GUIDE, ID_SYSTEM
