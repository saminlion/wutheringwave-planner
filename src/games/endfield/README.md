# Endfield Game Plugin

## Status: IN DEVELOPMENT

Endfield's character progression system is not yet fully known. This plugin serves as a placeholder structure.

## Known Information

### Level Progression (CONFIRMED)
Endfield uses the same ascension system as Wuthering Waves:

**Level Format:**
- 1-20: Base (no ascension)
- 20-40: 1st ascension (20A)
- 40-60: 2nd ascension (40A)
- 60-80: 3rd ascension (60A)
- 80-90: 4th ascension (80A, max level: 90)

### Materials
Material categories follow similar structure to WW (common, forgery, ascension, boss, weeklyBoss, player_exp, weapon_exp).

**Synthesis System (DIFFERENT FROM WW):**
- **WW**: 3:1 tier-based synthesis (3 lower tier → 1 higher tier)
- **Endfield**: Recipe-based synthesis (e.g., 1:3:1 - mixing different materials to create one result)
- Synthesis recipes are stored separately and need to be added when data becomes available

### Skills
- **Active Skills**: Confirmed to exist with level progression (similar to WW)
- **Passive Skills**: Not yet confirmed (TBD)

## Raw Data Input

Until the system is fully understood, use the **Endfield Data** page (`/endfield-data`) to input raw JSON data:

1. Character data
2. Weapon data
3. Material data

Data is stored in localStorage:
- `endfield_characters`
- `endfield_weapons`
- `endfield_materials`

## TODO

- [ ] Confirm max level and ascension breakpoints
- [ ] Define material categories
- [ ] Understand skill progression system
- [ ] Create character/weapon data files
- [ ] Implement level calculator specific to Endfield
- [ ] Add material synthesis rules (if applicable)

## How to Update

When Endfield's system becomes clear:

1. Update `config.js` with correct level format
2. Add actual data files to `data/` directory:
   - `character.json`
   - `weapon.json`
   - `materials.json`
   - `costs.json`
   - `tiers.js` (if synthesis exists)
3. Create helpers if needed (`helpers/` directory)
4. Define schemas (`schemas/` directory)
5. Update `index.js` exports

## Testing

Once data is available, test with a single character to validate:
- Level progression calculation
- Material requirements
- Synthesis logic (if any)

---

## Gameplay Research Notes

<!-- 플레이하면서 관찰한 내용을 여기에 적어주세요 -->

### Stamina System
- Daily limit:
- Regeneration rate:
- Max cap:
- Refresh items:

### Character Leveling Costs
**IMPORTANT: Character EXP uses different items for different level ranges**
- **Level 1→60**: Uses Combat Record series (player_exp_early)
  - Elementary Combat Record (200 EXP)
  - Intermediate Combat Record (1000 EXP)
  - Advanced Combat Record (10000 EXP)
- **Level 61→90**: Uses Cognitive Carrier series (player_exp_late)
  - Elementary Cognitive Carrier (1000 EXP)
  - Advanced Cognitive Carrier (10000 EXP)

### Skill System
- Number of active skills per character:
- Skill level range (1-10?):
- Skill upgrade materials:
- Passive skills exist? Y/N:

### Material Farming
| Material Type | Stage Name | Drops | Stamina Cost | Notes |
|--------------|------------|-------|--------------|-------|
| Credit | | | | |
| Common T1 | | | | |
| Common T2 | | | | |
| Common T3 | | | | |
| Common T4 | | | | |
| Forgery | | | | |
| Boss | | | | |
| Weekly Boss | | | | |

### Synthesis Recipes
<!-- 레시피 형식 예시: 3x Material A + 1x Material B = 1x Material C -->


### Weapon System
- Max weapon level:
- Weapon ascension breakpoints:
- Weapon types:
- Weapon upgrade materials:

### Other Observations
<!-- 기타 발견한 내용 -->
**Player EXP System (IMPLEMENTED):**
- The game uses two different EXP item series based on character level
- This has been implemented by splitting `player_exp` into:
  - `player_exp_early` (Lv.1-60): Combat Record series
  - `player_exp_late` (Lv.61-90): Cognitive Carrier series
- **Dungeon Choice System (Lv.3+):**
  - Lv.1-2 dungeons: Combat Record only (fixed)
  - Lv.3-5 dungeons: Player can choose between Combat Record or Cognitive Carrier
  - The planner calculates and displays the optimal choice distribution
  - Shows separate estimated runs for each type (similar to forgery tier display)
  - Total stamina is calculated without duplication (since it's the same dungeon)
- Both categories are automatically detected as EXP categories (thanks to `value` field)
- Each category displays separately in the planner UI
- Inventory tracks each item individually


---

*Last updated: 2026-01-23*
