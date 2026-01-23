import { costData as costs } from '@/games/wutheringwave';
import { processMaterials } from './core';
import { getLevelRangeDiff } from './plannerCalc';
import { ProgressionEngine } from '@/core/engine/progression';

const progressionEngine = new ProgressionEngine({
  costs: costs[0],
  processMaterials,
  getLevelRangeDiff,
});

export function calculateWeaponMaterials(settings, weaponInfo, rarity) {
  return progressionEngine.calculateWeaponMaterials(settings, weaponInfo, rarity);
}
