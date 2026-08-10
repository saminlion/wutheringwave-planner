/**
 * Duet Night Abyss Tiered Materials for Synthesis
 *
 * DNA has no confirmed tier-to-tier synthesis recipe. Materials DO carry tiers
 * (common T1-T2, ascension T1-T3, weapon_component T1-T3, talent T1-T3), but
 * nothing in-game converts a lower tier into a higher one at a known ratio, so
 * declaring a ratio here would invent conversions the planner would then apply.
 *
 * Consequences of leaving this empty:
 *   - Each tier is tracked and displayed independently (correct)
 *   - Tiered lineup dialogs still work — those key off the `tier` field in
 *     materials.json, not this table
 *   - No forward synthesis / backward conversion runs for DNA
 *
 * The one real crafting relation DNA has is Luno Memento 150 → forgery T2.
 * That is expressed directly in costs.json (skill levels 9 and 10 consume
 * `forgery_luno` 150 / 300) so the planner never needs to model the craft step.
 *
 * If tier synthesis is ever confirmed, add entries in the gfl2/tiers.js shape:
 *   subCategoryName: { 1: { name, game_id, synthesizable: { to: 2, count: N } }, ... }
 */
export const tieredMaterials = {};

// Reverse lookup: gameId -> tier info
export const tieredMaterialsByGameId = Object.entries(tieredMaterials).reduce(
  (acc, [categoryName, tiers]) => {
    for (const [, tierInfo] of Object.entries(tiers)) {
      if (tierInfo?.game_id) {
        acc[tierInfo.game_id] = {
          category: categoryName,
          ...tierInfo,
        };
      }
    }
    return acc;
  },
  {},
);
