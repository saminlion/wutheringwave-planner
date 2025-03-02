export const getLevelRangeDiff = (arrayData, currentLevel, targetLevel) => {
    // 현재 레벨과 목표 레벨의 인덱스 찾기
    const currentLevelIndex = arrayData.findIndex((arr) => arr.level === currentLevel);
    const targetLevelIndex = arrayData.findIndex((arr) => arr.level === targetLevel);
  
    if (currentLevelIndex === -1 || targetLevelIndex === -1) {
      throw new Error('Invalid currentLevel or targetLevel provided.');
    }
  
    // 현재 레벨과 목표 레벨 사이의 범위 추출
    return arrayData.slice(currentLevelIndex + 1, targetLevelIndex + 1);
  };