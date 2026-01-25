import { useGameStore } from '@/store/game';
import { MaterialCalculator } from '@/core/engine/calculator';
import logger from '@/utils/logger';

/**
 * 現在のゲームのマテリアルデータを取得
 */
const getInventoryItem = () => {
  const gameStore = useGameStore();
  return gameStore.getData('materials') || {};
};

/**
 * ?쒓뎅??二쇱꽍: 湲곕낯 寃뚯엫(Wuthering Waves)???щ즺 DB瑜?二쇱엯??怨꾩궛湲??몄뒪?댁뒪.
 * ?ν썑 硫??寃뚯엫 吏????gameConfig留?援먯껜?섎㈃ ?쒕떎.
 */
/**
 * 動的にMaterialCalculatorを取得
 */
const getMaterialCalculator = () => {
  return new MaterialCalculator({
    logger,
    materials: {
      database: getInventoryItem(),
    },
  });
};

/**
 * ?쒓뎅??二쇱꽍: 湲곗〈 ?⑥닔 ?쒓렇?덉쿂瑜??좎??섎㈃??肄붿뼱 怨꾩궛湲곕줈 ?꾩엫?쒕떎.
 */
export const calculateMaterials = (inventory, tieredMaterials, shortages) =>
  getMaterialCalculator().calculate(inventory, tieredMaterials, shortages);

/**
 * Utility: merges multiple material maps.
 */
export const mergeMaterials = (...materialSources) =>
  getMaterialCalculator().merge(...materialSources);

/**
 * Utility: extracts level difference range
 * レベル範囲の差分データを抽出する
 *
 * @param {Array} arrayData - レベルデータ配列 [{level: '20', ...}, {level: '20A', ...}]
 * @param {string} currentLevel - 現在のレベル ('1', '20', '20A' など)
 * @param {string} targetLevel - 目標レベル
 * @returns {Array} currentLevel+1からtargetLevelまでのコストデータ配列
 */
export const getLevelRangeDiff = (arrayData, currentLevel, targetLevel) => {
  const sortedData = arrayData.sort((a, b) =>
    a.level.localeCompare(b.level, undefined, { numeric: true })
  );

  let currentLevelIndex = sortedData.findIndex((arr) => arr.level === currentLevel);
  const targetLevelIndex = sortedData.findIndex((arr) => arr.level === targetLevel);

  // currentLevelが配列に存在しない場合（例: '1'がcosts.jsonにない）
  // → currentLevelより低いレベルから始まる場合、最初から計算を開始
  if (currentLevelIndex === -1) {
    // currentLevelの数値を抽出（'40A' → 40, '1' → 1）
    const currentNum = parseInt(currentLevel.replace(/[A-Za-z]/g, ''), 10);
    const firstEntryNum = parseInt(sortedData[0]?.level.replace(/[A-Za-z]/g, ''), 10);

    if (!isNaN(currentNum) && !isNaN(firstEntryNum) && currentNum < firstEntryNum) {
      // currentLevelが最初のエントリより低い → 最初から開始（index = -1として扱う）
      currentLevelIndex = -1;
    } else {
      logger.warn(`Current level "${currentLevel}" not found in cost data.`);
      return [];
    }
  }

  if (targetLevelIndex === -1) {
    logger.warn(`Target level "${targetLevel}" not found in cost data.`);
    return [];
  }

  return [...new Set(sortedData.slice(currentLevelIndex + 1, targetLevelIndex + 1))];
};
