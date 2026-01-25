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

export function calculateWeaponMaterials(settings, weaponInfo, rarity) {
  return getProgressionEngine().calculateWeaponMaterials(settings, weaponInfo, rarity);
}
