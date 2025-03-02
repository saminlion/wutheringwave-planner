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