import logger from '@/utils/logger';

/**
 * Synthesis engine for 3:1 material crafting.
 * Supports multi-game structure and injectable material database.
 */
export class SynthesisEngine {
  constructor(config = {}) {
    /**
     * Config: synthesis ratio (default 3:1), tier levels, cost logger for extensibility.
     */
    this.ratio = config.ratio ?? 3;
    this.tierLevels = config.tierLevels ?? 4;
    this.logger = config.logger ?? logger;
  }

  /**
   * Forward synthesis: craft higher tier materials from owned materials and shortages.
   */
  forward(inventory, tieredMaterials, shortages, inventoryItemDb) {
    const synthesisResults = {};
    const rawNeedResults = {};
    const uniqueSubCategories = this._findUniqueSubCategories(inventoryItemDb, shortages);

    this.logger.debug?.('Synthesis target subcategories', uniqueSubCategories);

    for (const category of uniqueSubCategories) {
      if (!Object.prototype.hasOwnProperty.call(tieredMaterials, category)) {
        continue;
      }

      const materialData = tieredMaterials[category];
      this.logger.debug?.('Category material data', { category, materialData });

      // Ascending tier list. Chains may start above 1 (e.g. ascension T2~T5).
      const tiers = Object.keys(materialData)
        .map(Number)
        .filter((t) => !Number.isNaN(t))
        .sort((a, b) => a - b);

      if (tiers.length === 0) {
        continue;
      }

      for (const tier of tiers) {
        const gid = materialData[tier].game_id;
        rawNeedResults[gid] = { from: gid, rawNeed: shortages[gid] ?? 0 };
      }

      /**
       * Pass 1 (top-down demand): compute how many units must be crafted INTO each
       * tier to cover its own shortage plus the demand propagated from tiers above.
       * Synthesize only the minimum required — never the full lower-tier surplus —
       * so we don't overshoot middle tiers or strand materials.
       */
      const craftInto = {};
      let demand = 0; // demanded units, expressed in the current tier's own units
      for (let i = tiers.length - 1; i >= 0; i -= 1) {
        const tier = tiers[i];
        const gid = materialData[tier].game_id;
        const required = (shortages[gid] ?? 0) + demand;
        const available = inventory[gid] ?? 0;

        if (available >= required) {
          // Owned (incl. surplus) covers this tier's own need plus demand from above.
          craftInto[tier] = 0;
          demand = 0;
        } else {
          const deficit = required - available;
          craftInto[tier] = deficit;
          if (i > 0) {
            const lower = materialData[tiers[i - 1]];
            const ratio = lower.synthesizable?.count ?? this.ratio;
            demand = deficit * ratio; // lower-tier units needed to craft `deficit`
          } else {
            // Lowest tier: cannot synthesize further. The remaining deficit stays in
            // inventory and is reported as a real shortage by backward().
            demand = 0;
          }
        }
      }

      /**
       * Pass 2 (bottom-up apply): craft each tier from the one below, limited by what
       * is actually available (owned + already-crafted lower tiers).
       */
      for (let i = 1; i < tiers.length; i += 1) {
        const tier = tiers[i];
        const want = craftInto[tier];
        if (!want || want <= 0) {
          continue;
        }

        const gid = materialData[tier].game_id;
        const lower = materialData[tiers[i - 1]];
        const lowerGid = lower.game_id;
        const ratio = lower.synthesizable?.count ?? this.ratio;

        const haveLower = inventory[lowerGid] ?? 0;
        const craftable = Math.min(want, Math.floor(haveLower / ratio));
        if (craftable <= 0) {
          continue;
        }

        inventory[lowerGid] = haveLower - craftable * ratio;
        inventory[gid] = (inventory[gid] ?? 0) + craftable;

        synthesisResults[gid] = {
          from: lowerGid,
          used: craftable * ratio,
          synthesized: craftable,
          rawNeed: shortages[gid] ?? 0,
        };
      }
    }

    return { updatedInventory: inventory, synthesisResults, rawNeedResults };
  }

  /**
   * Backward conversion: decompose higher tier excess materials to lower tiers.
   * Returns finalNeeds plus per-game_id decomposition tracking (consumed/gained).
   */
  backward(inventory, tieredMaterials, shortages) {
    const finalNeeds = { ...shortages };
    const decomposedConsumed = {};
    const decomposedGained = {};

    for (const category in tieredMaterials) {
      const materialData = tieredMaterials[category];
      const rarities = Object.keys(materialData).sort((a, b) => Number(b) - Number(a));

      for (const rarity of rarities) {
        const material = materialData[rarity];
        const materialGameId = material.game_id;
        const nextRarity = Number(rarity) - 1;
        const nextMaterial = materialData[nextRarity];
        const nextMaterialGameId = nextMaterial?.game_id;

        if (materialGameId in finalNeeds) {
          const required = finalNeeds[materialGameId] ?? 0;
          const available = inventory[materialGameId] ?? 0;

          /**
           * Config: Update shortage after subtracting owned quantity from required.
           */
          finalNeeds[materialGameId] = Math.max(0, required - available);
          inventory[materialGameId] = Math.max(0, available - required);
        }

        if (nextMaterialGameId) {
          const surplus = inventory[materialGameId] ?? 0;
          /**
           * Config: Decompose excess to lower tier based on ratio.
           */
          const conversionRate = material.synthesizable?.count ?? this.ratio;
          const converted = surplus * conversionRate;
          inventory[materialGameId] = 0;
          inventory[nextMaterialGameId] = (inventory[nextMaterialGameId] ?? 0) + converted;

          if (surplus > 0) {
            decomposedConsumed[materialGameId] = (decomposedConsumed[materialGameId] ?? 0) + surplus;
            decomposedGained[nextMaterialGameId] = (decomposedGained[nextMaterialGameId] ?? 0) + converted;
          }
        }
      }
    }

    return { finalNeeds, decomposedConsumed, decomposedGained };
  }

  /**
   * Config: Calculate synthesis range for subcategories containing shortage materials.
   */
  _findUniqueSubCategories(inventoryItemDb, shortages) {
    if (!inventoryItemDb) {
      return [];
    }

    const allItems = Object.values(inventoryItemDb)
      .flatMap(category => (category && typeof category === 'object' ? Object.values(category) : []));

    const matchedItems = allItems.filter(
      item => item && Object.prototype.hasOwnProperty.call(shortages, String(item.game_id)),
    );

    return [...new Set(matchedItems.map(item => item.SubCategory).filter(Boolean))];
  }
}

export default SynthesisEngine;
