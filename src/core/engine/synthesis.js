import logger from '@/utils/logger';

/**
 * Synthesis engine for tier-to-tier material crafting.
 *
 * Recipes live in each game's `data/tiers.js`, keyed by SubCategory:
 *
 *   subCategory: {
 *     1: { name, game_id, synthesizable: { to: 2, count: 4, extra: { 9110010002: 2 } } },
 *     2: { name, game_id },
 *   }
 *
 * `synthesizable` describes crafting FROM this tier INTO tier `to`:
 *   - `count`  — units of THIS tier consumed per one unit of `to` (defaults to
 *                the engine ratio). Every tier of every subcategory may differ.
 *   - `extra`  — optional `{ game_id: qtyPerCraft }` of ingredients from OTHER
 *                subcategories consumed alongside `count`. Their demand is
 *                propagated into the supplying subcategory's shortage, so the
 *                planner farms them, and it makes the craft irreversible (see
 *                `backward`) because those ingredients cannot be recovered.
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
   *
   * Cross-subcategory recipes force the two passes apart globally: every
   * subcategory's demand pass must finish before any crafting starts, because a
   * consumer's demand pass is what reveals how much of its supplier is needed.
   */
  forward(inventory, tieredMaterials, shortages, inventoryItemDb) {
    const synthesisResults = {};
    const rawNeedResults = {};
    const gameIdToSub = this._buildGameIdIndex(tieredMaterials);
    const seedSubCategories = this._findUniqueSubCategories(inventoryItemDb, shortages)
      .filter((sub) => Object.prototype.hasOwnProperty.call(tieredMaterials, sub));

    // Suppliers before consumers. Pass 1 walks this in reverse, pass 2 as-is.
    const supplierFirst = this._orderSubCategories(seedSubCategories, tieredMaterials, gameIdToSub);

    this.logger.debug?.('Synthesis target subcategories', supplierFirst);

    /**
     * Shortages grow as cross-subcategory ingredients are discovered: needing a
     * craft means needing its `extra` ingredients too. Callers should feed this
     * into `backward` so those ingredients surface as real needs.
     */
    const effectiveShortages = { ...shortages };
    const extraDemand = {};
    const craftPlans = {};

    /**
     * Pass 1 (top-down demand): compute how many units must be crafted INTO each
     * tier to cover its own shortage plus the demand propagated from tiers above.
     * Synthesize only the minimum required — never the full lower-tier surplus —
     * so we don't overshoot middle tiers or strand materials.
     */
    for (const category of [...supplierFirst].reverse()) {
      const materialData = tieredMaterials[category];
      const tiers = this._tiersOf(materialData);
      if (tiers.length === 0) {
        continue;
      }

      const craftInto = {};
      let demand = 0; // demanded units, expressed in the current tier's own units
      for (let i = tiers.length - 1; i >= 0; i -= 1) {
        const tier = tiers[i];
        const gid = materialData[tier].game_id;
        const required = (effectiveShortages[gid] ?? 0) + demand;
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
            const ratio = this._ratioOf(lower);
            demand = deficit * ratio; // lower-tier units needed to craft `deficit`

            // Ingredients pulled from other subcategories by the same craft.
            for (const [extraGid, perCraft] of this._extrasOf(lower)) {
              const needed = deficit * perCraft;
              effectiveShortages[extraGid] = (effectiveShortages[extraGid] ?? 0) + needed;
              extraDemand[extraGid] = (extraDemand[extraGid] ?? 0) + needed;
            }
          } else {
            // Lowest tier: cannot synthesize further. The remaining deficit stays in
            // inventory and is reported as a real shortage by backward().
            demand = 0;
          }
        }
      }

      craftPlans[category] = { tiers, craftInto };
    }

    for (const category of supplierFirst) {
      for (const tier of craftPlans[category]?.tiers ?? []) {
        const gid = tieredMaterials[category][tier].game_id;
        rawNeedResults[gid] = { from: gid, rawNeed: effectiveShortages[gid] ?? 0 };
      }
    }

    /**
     * Pass 2 (bottom-up apply): craft each tier from the one below, limited by what
     * is actually available (owned + already-crafted lower tiers, and for
     * cross-subcategory recipes the supplying ingredients as well).
     */
    for (const category of supplierFirst) {
      const plan = craftPlans[category];
      if (!plan) {
        continue;
      }

      const materialData = tieredMaterials[category];
      const { tiers, craftInto } = plan;

      for (let i = 1; i < tiers.length; i += 1) {
        const tier = tiers[i];
        const want = craftInto[tier];
        if (!want || want <= 0) {
          continue;
        }

        const gid = materialData[tier].game_id;
        const lower = materialData[tiers[i - 1]];
        const lowerGid = lower.game_id;
        const ratio = this._ratioOf(lower);
        if (ratio <= 0) {
          this.logger.warn?.('Invalid synthesis ratio, skipping craft', { category, tier, ratio });
          continue;
        }

        const extras = this._extrasOf(lower);
        const haveLower = inventory[lowerGid] ?? 0;
        let craftable = Math.min(want, Math.floor(haveLower / ratio));
        for (const [extraGid, perCraft] of extras) {
          craftable = Math.min(craftable, Math.floor((inventory[extraGid] ?? 0) / perCraft));
        }

        if (craftable <= 0) {
          continue;
        }

        inventory[lowerGid] = haveLower - craftable * ratio;
        inventory[gid] = (inventory[gid] ?? 0) + craftable;

        const usedExtra = {};
        for (const [extraGid, perCraft] of extras) {
          const used = craftable * perCraft;
          inventory[extraGid] = (inventory[extraGid] ?? 0) - used;
          usedExtra[extraGid] = used;
        }

        synthesisResults[gid] = {
          from: lowerGid,
          used: craftable * ratio,
          synthesized: craftable,
          rawNeed: effectiveShortages[gid] ?? 0,
          ...(extras.length > 0 ? { usedExtra } : {}),
        };
      }
    }

    return {
      updatedInventory: inventory,
      synthesisResults,
      rawNeedResults,
      effectiveShortages,
      extraDemand,
    };
  }

  /**
   * Backward conversion: decompose higher tier excess materials to lower tiers.
   * Returns finalNeeds plus per-game_id decomposition tracking (consumed/gained).
   *
   * Pass `forward()`'s `effectiveShortages` rather than the original shortages so
   * that cross-subcategory ingredients pulled in by a recipe are reported as needs.
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

        /**
         * A craft that consumed ingredients from other subcategories cannot be
         * undone — those ingredients are gone. Leave the surplus where it is
         * rather than conjuring lower-tier stock the player cannot actually get.
         */
        if (nextMaterialGameId && this._extrasOf(nextMaterial).length === 0) {
          const surplus = inventory[materialGameId] ?? 0;
          /**
           * Decompose excess to the lower tier. The rate is the LOWER tier's
           * `count` — that is how many of it went into one unit of this tier.
           */
          const conversionRate = this._ratioOf(nextMaterial);
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
   * Ascending numeric tier list. Chains may start above 1 (e.g. ascension T2~T5).
   */
  _tiersOf(materialData) {
    return Object.keys(materialData)
      .map(Number)
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => a - b);
  }

  /**
   * Units of `entry`'s tier consumed per one unit of the tier above.
   */
  _ratioOf(entry) {
    return entry?.synthesizable?.count ?? this.ratio;
  }

  /**
   * Cross-subcategory ingredients of `entry`'s craft, as [game_id, qtyPerCraft].
   */
  _extrasOf(entry) {
    const extra = entry?.synthesizable?.extra;
    if (!extra || typeof extra !== 'object') {
      return [];
    }
    return Object.entries(extra)
      .map(([gameId, qty]) => [gameId, Number(qty)])
      .filter(([, qty]) => Number.isFinite(qty) && qty > 0);
  }

  /**
   * Reverse index game_id -> owning subcategory, used to route `extra` demand.
   */
  _buildGameIdIndex(tieredMaterials) {
    const index = {};
    for (const [subCategory, tiers] of Object.entries(tieredMaterials ?? {})) {
      for (const entry of Object.values(tiers ?? {})) {
        if (entry?.game_id != null) {
          index[String(entry.game_id)] = subCategory;
        }
      }
    }
    return index;
  }

  /**
   * Depth-first post-order over `extra` edges, so a subcategory always lands after
   * the ones it draws ingredients from. Also pulls in supplier subcategories that
   * had no shortage of their own and so never appeared in the seed set.
   */
  _orderSubCategories(seedSubCategories, tieredMaterials, gameIdToSub) {
    const ordered = [];
    const state = {};

    const visit = (subCategory) => {
      if (state[subCategory] === 'done') {
        return;
      }
      if (state[subCategory] === 'visiting') {
        this.logger.warn?.('Cyclic synthesis dependency, breaking cycle at', subCategory);
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(tieredMaterials, subCategory)) {
        return;
      }

      state[subCategory] = 'visiting';
      for (const entry of Object.values(tieredMaterials[subCategory] ?? {})) {
        for (const [extraGid] of this._extrasOf(entry)) {
          const supplier = gameIdToSub[extraGid];
          if (supplier && supplier !== subCategory) {
            visit(supplier);
          }
        }
      }
      state[subCategory] = 'done';
      ordered.push(subCategory);
    };

    seedSubCategories.forEach(visit);
    return ordered;
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
