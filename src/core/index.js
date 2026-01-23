/**
 * 한국어 주석: 코어 엔진 모듈의 집결지.
 * 외부에서는 이 파일을 통해 핵심 클래스를 가져가도록 한다.
 */
import { SynthesisEngine } from './engine/synthesis';
import { MaterialCalculator } from './engine/calculator';
import { ProgressionEngine } from './engine/progression';
import { InventoryEngine } from './engine/inventory';

export { SynthesisEngine, MaterialCalculator, ProgressionEngine, InventoryEngine };

/**
 * 한국어 주석: 게임 구성(config)을 받아 핵심 엔진 묶음을 한 번에 생성하는 편의 함수.
 */
export function createGameEngine(gameConfig = {}) {
  const synthesis = new SynthesisEngine(gameConfig.materials?.synthesis);
  const calculator = new MaterialCalculator(gameConfig);
  const progression = new ProgressionEngine({
    ...gameConfig,
    calculator,
  });

  return {
    synthesis,
    calculator,
    progression,
  };
}
