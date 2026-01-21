import {
  characters,
  weapons,
  materials,
  costs,
  tieredMaterials,
  tieredMaterialsByGameId,
} from './data';

/**
 * 한국어 주석: Wuthering Waves 전용 플러그인 설정.
 * 추후 게임 레지스트리에서 이 설정을 로드해 코어 엔진에 주입한다.
 */
export const wutheringWaveConfig = {
  id: 'wutheringwave',
  name: 'Wuthering Waves',
  shortName: 'WW',
  version: '1.0.0',
  materials: {
    database: materials,
    tiers: tieredMaterials,
    tiersByGameId: tieredMaterialsByGameId,
    synthesis: {
      ratio: 3,
      tierLevels: 4,
    },
  },
  costs,
  data: {
    characters,
    weapons,
  },
};

export default wutheringWaveConfig;
