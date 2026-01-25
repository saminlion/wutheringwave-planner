import { useGameStore } from '@/store/game';
import SynthesisEngine from '@/core/engine/synthesis';

/**
 * 現在のゲームのマテリアルデータを取得
 */
const getInventoryItem = () => {
  const gameStore = useGameStore();
  return gameStore.getData('materials') || {};
};

/**
 * ?쒓뎅??二쇱꽍: 硫??寃뚯엫 援ъ“ ?꾪솚???꾪빐 肄붿뼱 ?붿쭊??二쇱엯?섎뒗 ?섑띁.
 */
const synthesisEngine = new SynthesisEngine();

/**
 * ?쒓뎅??二쇱꽍: 湲곗〈 API瑜??좎??섎㈃?????붿쭊??forward 濡쒖쭅???몄텧?쒕떎.
 */
export const performItemSynthesisWithNeeds = (
    inventory,
    tieredMaterials,
    shortages,
    inventoryItems = null,
) => {
    const items = inventoryItems || getInventoryItem();
    return synthesisEngine.forward(inventory, tieredMaterials, shortages, items);
};

/**
 * ?쒓뎅??二쇱꽍: surplus 泥섎━ ??떆 肄붿뼱 ?붿쭊?쇰줈 ?꾩엫???쇨??깆쓣 留욎텣??
 */
export const backwardConversion = (inventory, tieredMaterials, shortages) =>
    synthesisEngine.backward(inventory, tieredMaterials, shortages);
