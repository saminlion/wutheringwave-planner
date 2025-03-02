export const calculateMaterials = (plannedCharacters) => {
    const totalMaterials = {};
  
    plannedCharacters.forEach((character) => {
      // 스킬과 레벨 차이에 따른 재료 계산 (예시 로직)
      character.skills.forEach((skill) => {
        const key = skill.material;
        if (!totalMaterials[key]) {
          totalMaterials[key] = { name: key, count: 0 };
        }
        totalMaterials[key].count += skill.targetLevel - skill.currentLevel;
      });
    });
  
    return Object.values(totalMaterials);
  };
  