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
   * 武器材料計算
   */
  calculateWeaponMaterials(settings, weaponInfo, rarity) {
    const weaponCosts = this.costs.weapon ?? {};
    const levelCosts = weaponCosts[`level_${rarity}`];

    this.logger.debug?.('calculateWeaponMaterials - rarity:', rarity);
    this.logger.debug?.('calculateWeaponMaterials - levelCosts key:', `level_${rarity}`);
    this.logger.debug?.('calculateWeaponMaterials - levelCosts:', levelCosts);

    if (!levelCosts) {
      this.logger.warn?.('calculateWeaponMaterials - no levelCosts found for rarity:', rarity);
      return {};
    }

    this.logger.debug?.('calculateWeaponMaterials - currentLevel:', settings.currentLevel, 'targetLevel:', settings.targetLevel);

    const levels = this._getLevelRange(
      Object.entries(levelCosts).map(([level, data]) => ({ level, ...data })),
      settings.currentLevel,
      settings.targetLevel,
    );

    this.logger.debug?.('calculateWeaponMaterials - levels to process:', levels.length);

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
    const masteryCostsTable = characterCosts.mastery ?? {};
    const result = {};

    // Endfield nested structure: settings.skills = { basic_attack: { current_level, target_level, current_mastery, target_mastery } }
    if (settings.skills && typeof settings.skills === 'object') {
      Object.entries(settings.skills).forEach(([skillName, skillData]) => {
        if (!skillData || typeof skillData !== 'object') return;

        // Skill level calculation (1~9)
        const currentLevel = Number.parseInt(skillData.current_level, 10) || 1;
        const targetLevel = Number.parseInt(skillData.target_level, 10) || 1;

        if (currentLevel < targetLevel) {
          for (let i = currentLevel + 1; i <= targetLevel; i += 1) {
            const skillCosts = skillCostsTable[i];
            if (skillCosts) {
              Object.entries(skillCosts).forEach(([materialKey, amount]) => {
                this._process(result, materialKey, amount, characterInfo);
              });
            }
          }
        }

        // Mastery calculation (0~3)
        const currentMastery = Number.parseInt(skillData.current_mastery, 10) || 0;
        const targetMastery = Number.parseInt(skillData.target_mastery, 10) || 0;

        if (currentMastery < targetMastery) {
          for (let i = currentMastery + 1; i <= targetMastery; i += 1) {
            const masteryCosts = masteryCostsTable[i];
            if (masteryCosts) {
              Object.entries(masteryCosts).forEach(([materialKey, amount]) => {
                this._process(result, materialKey, amount, characterInfo);
              });
            }
          }
        }
      });

      return result;
    }

    // WW flat structure: settings.activeSkills = { xxx_current_level, xxx_target_level }
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

    // === Endfield structure ===
    // special (talent): settings.special = { talent_1: { current_level, target_level } }
    if (settings.special && typeof settings.special === 'object') {
      const talentCosts = characterCosts.talent ?? {};
      Object.entries(settings.special).forEach(([talentKey, talentData]) => {
        if (!talentData || typeof talentData !== 'object') return;

        const currentLevel = Number.parseInt(talentData.current_level, 10) || 0;
        const targetLevel = Number.parseInt(talentData.target_level, 10) || 0;

        if (currentLevel >= targetLevel) return;

        // talent_1 → talent1, talent_2 → talent2
        const costKey = talentKey.replace('_', '');
        const talentTable = talentCosts[costKey];

        if (talentTable) {
          for (let level = currentLevel + 1; level <= targetLevel; level += 1) {
            const costs = talentTable[level];
            if (costs) {
              Object.entries(costs).forEach(([materialKey, amount]) => {
                this._process(result, materialKey, amount, characterInfo);
              });
            }
          }
        }
      });
    }

    // baseSkill: settings.baseSkill = { base_skill_1: { current_level, target_level } }
    if (settings.baseSkill && typeof settings.baseSkill === 'object') {
      const baseSkillCosts = characterCosts.baseskill ?? {};
      Object.entries(settings.baseSkill).forEach(([baseKey, baseData]) => {
        if (!baseData || typeof baseData !== 'object') return;

        const currentLevel = Number.parseInt(baseData.current_level, 10) || 0;
        const targetLevel = Number.parseInt(baseData.target_level, 10) || 0;

        if (currentLevel >= targetLevel) return;

        // base_skill_1 → base1, base_skill_2 → base2
        const costKey = baseKey.replace('base_skill_', 'base');
        const baseTable = baseSkillCosts[costKey];

        if (baseTable) {
          for (let level = currentLevel + 1; level <= targetLevel; level += 1) {
            const costs = baseTable[level];
            if (costs) {
              Object.entries(costs).forEach(([materialKey, amount]) => {
                this._process(result, materialKey, amount, characterInfo);
              });
            }
          }
        }
      });
    }

    // attributes: settings.attributes = { attribute_1: true/false, ... }
    if (settings.attributes && typeof settings.attributes === 'object') {
      const attributeCosts = characterCosts.attribute ?? {};
      Object.entries(settings.attributes).forEach(([attrKey, isUnlocked]) => {
        if (!isUnlocked) return;

        // attribute_1 → 1, attribute_2 → 2, etc.
        const attrNum = attrKey.replace('attribute_', '');
        const costs = attributeCosts[attrNum];

        if (costs) {
          Object.entries(costs).forEach(([materialKey, amount]) => {
            this._process(result, materialKey, amount, characterInfo);
          });
        }
      });
    }

    // === WW structure ===
    const passiveSkills = settings.passiveSkills || {};

    // 新構造: current_level/target_level ベースのレベル計算
    Object.keys(passiveSkills).forEach((key) => {
      if (!key.endsWith('_current_level')) {
        return;
      }

      const base = key.replace('_current_level', '');
      const current = Number.parseInt(passiveSkills[key], 10) || 0;
      const target = Number.parseInt(passiveSkills[`${base}_target_level`], 10) || 0;

      if (current >= target) {
        return;
      }

      // passive_ability または bonus_stat_N の判定
      let costType = null;
      if (base === 'passive_ability') {
        costType = 'skill';
      } else if (base.startsWith('bonus_stat_')) {
        costType = 'stat';
      }

      if (!costType) {
        return;
      }

      // current+1 から target までの各レベルのコストを加算
      for (let level = current + 1; level <= target; level += 1) {
        // costs.jsonのキーは文字列なので変換
        const passiveCosts = passiveCostsTable[costType]?.[String(level)];
        if (passiveCosts) {
          Object.entries(passiveCosts).forEach(([materialKey, amount]) => {
            this._process(result, materialKey, amount, characterInfo);
          });
        }
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
