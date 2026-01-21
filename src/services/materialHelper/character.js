import { costData as costs } from '@/games/wutheringwave';
import { processMaterials } from './core';
import { getLevelRangeDiff } from './plannerCalc';
import { ProgressionEngine } from '@/core/engine/progression';

const progressionEngine = new ProgressionEngine({
  costs: costs[0],
  processMaterials,
  getLevelRangeDiff,
});

export function calculateCharacterMaterials(settings, characterInfo) {
  return progressionEngine.calculateCharacterMaterials(settings, characterInfo);
}

export function calculateLevelMaterials(settings, characterInfo) {
  return progressionEngine.getCharacterLevelMaterials(settings, characterInfo);
}

export function calculateSkillMaterials(settings, characterInfo) {
  return progressionEngine.getCharacterSkillMaterials(settings, characterInfo);
}

export function calculatePassiveMaterials(settings, characterInfo) {
  return progressionEngine.getCharacterPassiveMaterials(settings, characterInfo);
}
