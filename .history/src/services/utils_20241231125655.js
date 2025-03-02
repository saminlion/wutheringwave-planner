export const getLevelRangeDiff = (arrayData, currentLevel, targetLevel) => {
  // 레벨 데이터를 정렬 (문자열 비교 기반)
  const sortedData = arrayData.sort((a, b) => {
    const levelA = a.level;
    const levelB = b.level;
    return levelA.localeCompare(levelB, undefined, { numeric: true });
  });

  // 현재 레벨과 목표 레벨의 인덱스 찾기
  const currentLevelIndex = sortedData.findIndex((arr) => arr.level === currentLevel);
  const targetLevelIndex = sortedData.findIndex((arr) => arr.level === targetLevel);

  if (currentLevelIndex === -1 || targetLevelIndex === -1) {
    throw new Error('Invalid currentLevel or targetLevel provided.');
  }

  // 현재 레벨과 목표 레벨 사이의 범위 추출
  return sortedData.slice(currentLevelIndex + 1, targetLevelIndex + 1);
  };