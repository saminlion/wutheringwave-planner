 import logger from '@/utils/logger';
import { MaterialCalculator } from './calculator';

/**
 * ?      :          ?  ?   ?  (?  , ?  , ?   ? ?   ?   ?       ?  .
 *     ?    ?          ?   ?              ?   ?  ?  ?   ?   ?  .
 */
export class ProgressionEngine {
  constructor(options = {}) {
    this.logger = options.logger ?? logger;
    this.costs = options.costs ?? {};
    this.processMaterials = options.processMaterials;
    this.getLevelRangeDiff = options.getLevelRangeDiff;
    this.calculator = options.calculator ?? null;
    this.mergeFn = options.mergeMaterials ?? this._mergeMaterials.bind(this);

    // ?    MaterialCalculator ?   ?   ?   (?   materials ?     ?   ?  )
    if (!this.calculator && options.materials) {
      this.calculator = new MaterialCalculator({
        logger: this.logger,
        materials: options.materials,
      });
    }
  }

  /**
   * ?      :     ?  /?  /?      ?   ?   ?    ?  ?  .
   */
  calculateCharacterMaterials(settings, characterInfo) {
    const level = this._calculateCharacterLevelMaterials(settings, characterInfo);
    const skill = this._calculateCharacterSkillMaterials(settings, characterInfo);
    const passive = this._calculateCharacterPassiveMaterials(settings, characterInfo);
    return this.mergeFn(level, skill, passive);
  }

  getCharacterLevelMaterials(settings, characterInfo) {
    return this._calculateCharacterLevelMaterials(settings, characterInfo);
  }

  getCharacterSkillMaterials(settings, characterInfo) {
    return this._calculateCharacterSkillMaterials(settings, characterInfo);
  }

  getCharacterPassiveMaterials(settings, characterInfo) {
    return this._calculateCharacterPassiveMaterials(settings, characterInfo);
  }

  /**
   * ?      :     ?   ?   ?   ?   ?   ?  .
   */
  calculateWeaponMaterials(settings, weaponInfo, rarity) {
    const weaponCosts = this.costs.weapon ?? {};
    const levelCosts = weaponCosts[`level_${rarity}`];
    if (!levelCosts) {
      return {};
    }

    const levels = this._getLevelRange(
      Object.entries(levelCosts).map(([level, data]) => ({ level, ...data })),
      settings.currentLevel,
      settings.targetLevel,
    );

    const result = {};
    levels.forEach((levelData) => {
      Object.entries(levelData).forEach(([key, value]) => {
        if (key !== 'level') {
          this._process(result, key, value, weaponInfo);
        }
      });
    });

    return result;
  }

  _calculateCharacterLevelMaterials(settings, characterInfo) {
    const characterCosts = this.costs.character ?? {};
    const levelCosts = characterCosts.level ?? {};

    const levels = this._getLevelRange(
      Object.entries(levelCosts).map(([level, data]) => ({ level, ...data })),
      settings.currentLevel,
      settings.targetLevel,
    );

    const result = {};
    levels.forEach((levelData) => {
      Object.entries(levelData).forEach(([key, value]) => {
        if (key !== 'level') {
          this._process(result, key, value, characterInfo);
        }
      });
    });
    return result;
  }

  _calculateCharacterSkillMaterials(settings, characterInfo) {
    const characterCosts = this.costs.character ?? {};
    const skillCostsTable = characterCosts.skill ?? {};
    const result = {};

    const skills = settings.activeSkills || {};
    Object.keys(skills).forEach((key) => {
      if (!key.endsWith('_current_level')) {
        return;
      }
      const base = key.replace('_current_level', '');
      const current = Number.parseInt(skills[key], 10);
      const target = Number.parseInt(skills[`${base}_target_level`], 10);
      if (Number.isNaN(current) || Number.isNaN(target) || current >= target) {
        return;
      }

      for (let i = current + 1; i <= target; i += 1) {
        const skillCosts = skillCostsTable[i];
        if (!skillCosts) {
          continue;
        }
        Object.entries(skillCosts).forEach(([materialKey, amount]) => {
          this._process(result, materialKey, amount, characterInfo);
        });
      }
    });

    return result;
  }

  _calculateCharacterPassiveMaterials(settings, characterInfo) {
    const characterCosts = this.costs.character ?? {};
    const passiveCostsTable = characterCosts.passive ?? {};
    const result = {};

    Object.entries(settings.passiveSkills || {}).forEach(([key, isEnabled]) => {
      if (!isEnabled) {
        return;
      }

      let passiveCosts;
      if (key.startsWith('passive_ability')) {
        const idx = key.split('_').pop();
        passiveCosts = passiveCostsTable.skill?.[idx];
      } else if (key.startsWith('bonus_stats_')) {
        const tier = key.split('_')[2];
        passiveCosts = passiveCostsTable.stat?.[tier];
      }

      if (passiveCosts) {
        Object.entries(passiveCosts).forEach(([materialKey, amount]) => {
          this._process(result, materialKey, amount, characterInfo);
        });
      }
    });

    return result;
  }

  _getLevelRange(levelData, currentLevel, targetLevel) {
    if (typeof this.getLevelRangeDiff === 'function') {
      return this.getLevelRangeDiff(levelData, currentLevel, targetLevel);
    }
    this.logger.warn?.('getLevelRangeDiff ?     ?  ? ? ?  ?   ');
    return [];
  }

  _process(materials, key, value, entityInfo) {
    if (typeof this.processMaterials === 'function') {
      this.processMaterials(materials, key, value, entityInfo);
      return;
    }

    if (key === 'level') {
      return;
    }

    if (typeof value === 'number') {
      materials[key] = (materials[key] || 0) + value;
    }
  }

  _mergeMaterials(...sources) {
    const merged = {};
    sources.forEach((source) => {
      if (!source) {
        return;
      }
      Object.entries(source).forEach(([material, amount]) => {
        if (material === 'processed') {
          return;
        }
        if (typeof amount !== 'number') {
          return;
        }
        merged[material] = (merged[material] || 0) + amount;
      });
    });
    return merged;
  }
}

export default ProgressionEngine;
