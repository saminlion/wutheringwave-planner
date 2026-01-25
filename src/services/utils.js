import logger from '@/utils/logger';

export const setGradientStyle = (rawData, isBorder = false) => {
  // nullチェック
  if (!rawData) {
    logger.warn('setGradientStyle: rawData is null');
    return { backgroundColor: '#808080' }; // デフォルトのグレー
  }

  const rarityColors = {
    3: "#3b82f680",
    4: "#6B60B5",
    5: "#C88844"
  };

  const elementColors = {
    glacio: '#74D4FF',
    fusion: '#FF5E5E',
    electro: '#C082FF',
    aero: '#53FFC8',
    spectro: '#FFD700',
    havoc: '#FF6AC1',
  };
  if (!isBorder) {
    if (rawData.element) {
      return {

        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity]} 40%, #FFFFFF 1%, ${elementColors[rawData.element]} 59%) `,
      };
    }
    else {
      return {

        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity]} 60%, #FFFFFF 1%) `,
      };
    }
  }

  else {
    if (rawData.element) {
      return {
        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity]} 40%, ${elementColors[rawData.element]} 59%)`,
        border: '5px solid transparent',
        backgroundClip: 'padding-box',
      };
    }
    else {
      logger.debug('Rendering weapon gradient');
      return {
        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity]} 60%, #FFFFFF 1%)`,
        border: '5px solid transparent',
        backgroundClip: 'padding-box',
      };
    }
  }
};