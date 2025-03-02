export const getLevelRangeDiff = (arrayData, currentLevel, targetLevel) => {
  const sortedData = arrayData.sort((a, b) => a.level.localeCompare(b.level, undefined, { numeric: true }));

  const currentLevelIndex = sortedData.findIndex((arr) => arr.level === currentLevel);
  const targetLevelIndex = sortedData.findIndex((arr) => arr.level === targetLevel);

  if (currentLevelIndex === -1 || targetLevelIndex === -1) {
    console.warn('Invalid level range provided.');
    return [];
  }

  // 중복 제거 후 반환
  return [...new Set(sortedData.slice(currentLevelIndex + 1, targetLevelIndex + 1))];
};

export const setGradientStyle = (rawData, isBorder = false) => {

  const rarityColors = {
    3: "#6B60B5",
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

        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity]} 40%, #FFFFFF 1%) `,
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
      console.log('weapon');
      return {
        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity]} 70%, #FFFFFF 1%)`,
        border: '5px solid transparent',
        backgroundClip: 'padding-box',
      };
    }
  }
};