/**
 * Game Plugin Registry
 * 게임 플러그인 등록 및 조회
 */
import wutheringWavePlugin from './wutheringwave';
import endfieldPlugin from './endfield';

// 등록된 게임 플러그인
const games = {
  wutheringwave: wutheringWavePlugin,
  endfield: endfieldPlugin,
};

// 지원 게임 목록
export const supportedGames = [
  {
    id: 'wutheringwave',
    name: 'Wuthering Waves',
    shortName: 'WW',
    icon: '🌊',
    enabled: true,
  },
  {
    id: 'endfield',
    name: 'Endfield',
    shortName: 'EF',
    icon: '🔷',
    enabled: true,
  },
];

/**
 * 게임 플러그인 조회
 * @param {string} gameId - 게임 ID
 * @returns {object|null} 게임 플러그인 또는 null
 */
export function getGame(gameId) {
  return games[gameId] ?? null;
}

/**
 * 게임 설정 조회
 * @param {string} gameId - 게임 ID
 * @returns {object|null} 게임 설정 또는 null
 */
export function getGameConfig(gameId) {
  const game = getGame(gameId);
  return game?.config ?? null;
}

/**
 * 게임 데이터 조회
 * @param {string} gameId - 게임 ID
 * @param {string} type - 데이터 타입 (characters, weapons, materials, costs, tiers)
 * @returns {object|null} 데이터 또는 null
 */
export function getGameData(gameId, type) {
  const game = getGame(gameId);
  if (!game) return null;

  // getData 메서드가 있으면 사용
  if (typeof game.getData === 'function') {
    return game.getData(type);
  }

  // 직접 접근
  if (type === 'characters') return game.data?.characters ?? null;
  if (type === 'weapons') return game.data?.weapons ?? null;
  if (type === 'materials') return game.materials?.database ?? null;
  if (type === 'costs') return game.costs ?? null;
  if (type === 'tiers') return game.materials?.tiers ?? null;

  return null;
}

/**
 * 활성화된 게임 목록 조회
 * @returns {Array} 활성화된 게임 목록
 */
export function getEnabledGames() {
  return supportedGames.filter((g) => g.enabled);
}

/**
 * 기본 게임 ID
 */
export const DEFAULT_GAME_ID = 'wutheringwave';

export { games };
export default games;
