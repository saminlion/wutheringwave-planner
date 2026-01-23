 import SynthesisEngine from './synthesis';
import logger from '@/utils/logger';

/**
 * ?      : ?   ?  /    ?  ?  ?   ?  ?           ?
 *                ?       ?     ?   ?  ?   ?  ?      ?  .
 */
export class MaterialCalculator {
  constructor(gameConfig = {}) {
    this.logger = gameConfig.logger ?? logger;
    const synthesisConfig = gameConfig.materials?.synthesis ?? {};
    this.synthesis = gameConfig.synthesisEngine ?? new SynthesisEngine(synthesisConfig);
    this.materialDatabase = gameConfig.materials?.database;
  }

  /**
   * ?      : ?       ?                ?  .
   */
  calculate(inventory, tieredMaterials, shortages) {
    this.logger.debug?.('    ?  ?  ', inventory);
    this.logger.debug?.('         ', shortages);

    const forwardResult = this.synthesis.forward(
      inventory,
      tieredMaterials,
      shortages,
      this.materialDatabase,
    );

    const finalNeeds = this.synthesis.backward(
      forwardResult.updatedInventory,
      tieredMaterials,
      shortages,
    );

    const synthesizedPerGameId = this._extractSynthesized(forwardResult);
    const rawNeeds = this._extractRawNeeds(forwardResult);

    this.logger.debug?.('   ?        ', finalNeeds);
    this.logger.debug?.('?   ?   ?  ', synthesizedPerGameId);

    return {
      final_inventory: forwardResult.updatedInventory,
      synthesis_results: forwardResult.synthesisResults,
      final_needs: finalNeeds,
      synthesized_per_game_id: synthesizedPerGameId,
      raw_needs: rawNeeds,
    };
  }

  /**
   * ?      : ?   ?       ?       
   */
  merge(...materialSources) {
    const merged = {};
    materialSources.forEach((source) => {
      Object.entries(source || {}).forEach(([material, amount]) => {
        merged[material] = (merged[material] || 0) + amount;
      });
    });
    return merged;
  }

  /**
   * ?      : ?   ?   game_id       ?   
   */
  _extractSynthesized(forwardResult) {
    const synthesizedPerGameId = {};
    Object.entries(forwardResult.synthesisResults || {}).forEach(([gameId, { synthesized }]) => {
      synthesizedPerGameId[gameId] = synthesized;
    });
    return synthesizedPerGameId;
  }

  /**
   * ?      : ?   ?      game_id       ?  ?  .
   */
  _extractRawNeeds(forwardResult) {
    const rawNeeds = {};
    Object.entries(forwardResult.rawNeedResults || {}).forEach(([gameId, { rawNeed }]) => {
      rawNeeds[gameId] = rawNeed;
    });
    return rawNeeds;
  }
}

export default MaterialCalculator;
