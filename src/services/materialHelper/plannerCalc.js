import { inventoryMaterials as inventoryItem } from '@/games/wutheringwave';
import { MaterialCalculator } from '@/core/engine/calculator';
import logger from '@/utils/logger';

/**
 * ?쒓뎅??二쇱꽍: 湲곕낯 寃뚯엫(Wuthering Waves)???щ즺 DB瑜?二쇱엯??怨꾩궛湲??몄뒪?댁뒪.
 * ?ν썑 硫??寃뚯엫 吏????gameConfig留?援먯껜?섎㈃ ?쒕떎.
 */
export const materialCalculator = new MaterialCalculator({
  logger,
  materials: {
    database: inventoryItem,
  },
});

/**
 * ?쒓뎅??二쇱꽍: 湲곗〈 ?⑥닔 ?쒓렇?덉쿂瑜??좎??섎㈃??肄붿뼱 怨꾩궛湲곕줈 ?꾩엫?쒕떎.
 */
export const calculateMaterials = (inventory, tieredMaterials, shortages) =>
  materialCalculator.calculate(inventory, tieredMaterials, shortages);

/**
 * Utility: merges multiple material maps.
 */
export const mergeMaterials = (...materialSources) =>
  materialCalculator.merge(...materialSources);

/**
 * Utility: extracts level difference range
 */
export const getLevelRangeDiff = (arrayData, currentLevel, targetLevel) => {
  const sortedData = arrayData.sort((a, b) =>
    a.level.localeCompare(b.level, undefined, { numeric: true })
  );

  const currentLevelIndex = sortedData.findIndex((arr) => arr.level === currentLevel);
  const targetLevelIndex = sortedData.findIndex((arr) => arr.level === targetLevel);

  if (currentLevelIndex === -1 || targetLevelIndex === -1) {
    logger.warn('Invalid level range provided.');
    return [];
  }

  return [...new Set(sortedData.slice(currentLevelIndex + 1, targetLevelIndex + 1))];
};
