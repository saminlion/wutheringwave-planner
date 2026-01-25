import { useGameStore } from '@/store/game';
import { processMaterials } from './core';
import { getLevelRangeDiff } from './plannerCalc';
import { ProgressionEngine } from '@/core/engine/progression';

/**
 * 現在のゲームのコストデータでProgressionEngineを作成
 */
const getProgressionEngine = () => {
  const gameStore = useGameStore();
  const costs = gameStore.getData('costs');
  // WW: costs is array [{ character, weapon }], Endfield: costs is { character, weapon }
  const normalizedCosts = Array.isArray(costs) ? costs[0] : costs;
  return new ProgressionEngine({
    costs: normalizedCosts || {},
    processMaterials,
    getLevelRangeDiff,
  });
};

export function calculateCharacterMaterials(settings, characterInfo) {
  return getProgressionEngine().calculateCharacterMaterials(settings, characterInfo);
}

export function calculateLevelMaterials(settings, characterInfo) {
  return getProgressionEngine().getCharacterLevelMaterials(settings, characterInfo);
}

export function calculateSkillMaterials(settings, characterInfo) {
  return getProgressionEngine().getCharacterSkillMaterials(settings, characterInfo);
}

export function calculatePassiveMaterials(settings, characterInfo) {
  return getProgressionEngine().getCharacterPassiveMaterials(settings, characterInfo);
}
