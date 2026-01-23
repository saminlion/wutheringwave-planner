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

      for (const key in materialData) {
        const currentLevel = materialData[key];
        const nextLevel = materialData[Number(key) + 1];
        if (!nextLevel) {
          continue;
        }

        const currentGameId = currentLevel.game_id;
        const nextGameId = nextLevel.game_id;

        const currentCount = inventory[currentGameId] ?? 0;
        const synthesisCount = currentLevel.synthesizable?.count ?? 1;
        const needed = shortages[currentGameId] ?? 0;

        /**
         * Config: Only use excess materials beyond shortage for synthesis.
         */
        const availableForSynthesis = Math.max(0, currentCount - needed);
        const synthesisQty = Math.floor(availableForSynthesis / synthesisCount);

        if (synthesisQty > 0) {
          inventory[currentGameId] -= synthesisQty * synthesisCount;
          inventory[nextGameId] = (inventory[nextGameId] ?? 0) + synthesisQty;

          synthesisResults[nextGameId] = {
            from: currentGameId,
            used: synthesisQty * synthesisCount,
            synthesized: synthesisQty,
            rawNeed: shortages[nextGameId] ?? 0,
          };
        }

        rawNeedResults[currentGameId] = {
          from: currentGameId,
          rawNeed: shortages[currentGameId] ?? 0,
        };
      }
    }

    return { updatedInventory: inventory, synthesisResults, rawNeedResults };
  }

  /**
   * Backward conversion: decompose higher tier excess materials to lower tiers.
   */
  backward(inventory, tieredMaterials, shortages) {
    const finalNeeds = { ...shortages };

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
        }
      }
    }

    return finalNeeds;
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
