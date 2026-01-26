import logger from './logger';
import errorHandler, { AppError, ErrorTypes } from './errorHandler';

/**
 * localStorage 헬퍼 유틸리티
 * 자동 에러 처리 및 로깅 포함
 */

const GLOBAL_PREFIX = 'gameplanner';

/**
 * Storage 키 생성
 * @param {string} key - 저장소 키
 * @param {string} gameId - 게임 ID (선택사항)
 * @returns {string} 전체 키 이름
 */
export function getStorageKey(key, gameId = null) {
  if (gameId) {
    return `${GLOBAL_PREFIX}_${key}_${gameId}`;
  }
  return `${GLOBAL_PREFIX}_${key}`;
}

/**
 * 데이터 저장
 * @param {string} key - 저장소 키
 * @param {any} data - 저장할 데이터
 * @param {string} gameId - 게임 ID (선택사항)
 * @returns {boolean} 성공 여부
 */
export function saveToStorage(key, data, gameId = null) {
  try {
    const storageKey = getStorageKey(key, gameId);
    const serialized = JSON.stringify(data);
    localStorage.setItem(storageKey, serialized);
    logger.debug(`Saved to storage: ${storageKey}`, data);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      const customError = new AppError(
        'Storage quota exceeded',
        ErrorTypes.STORAGE,
        { key, gameId }
      );
      errorHandler.handle(customError, 'saveToStorage');
    } else {
      errorHandler.handle(error, 'saveToStorage');
    }
    return false;
  }
}

/**
 * 데이터 로드
 * @param {string} key - 저장소 키
 * @param {any} defaultValue - 기본값
 * @param {string} gameId - 게임 ID (선택사항)
 * @returns {any} 로드된 데이터 또는 기본값
 */
export function loadFromStorage(key, defaultValue = null, gameId = null) {
  try {
    const storageKey = getStorageKey(key, gameId);
    const item = localStorage.getItem(storageKey);

    if (item === null) {
      logger.debug(`No data found in storage: ${storageKey}`);
      return defaultValue;
    }

    const data = JSON.parse(item);
    logger.debug(`Loaded from storage: ${storageKey}`, data);
    return data;
  } catch (error) {
    errorHandler.handle(error, 'loadFromStorage');
    return defaultValue;
  }
}

/**
 * 데이터 삭제
 * @param {string} key - 저장소 키
 * @param {string} gameId - 게임 ID (선택사항)
 * @returns {boolean} 성공 여부
 */
export function removeFromStorage(key, gameId = null) {
  try {
    const storageKey = getStorageKey(key, gameId);
    localStorage.removeItem(storageKey);
    logger.debug(`Removed from storage: ${storageKey}`);
    return true;
  } catch (error) {
    errorHandler.handle(error, 'removeFromStorage');
    return false;
  }
}

/**
 * 전체 스토리지 초기화
 * @param {string} gameId - 특정 게임 ID만 삭제 (선택사항)
 * @returns {boolean} 성공 여부
 */
export function clearStorage(gameId = null) {
  try {
    if (gameId) {
      // 특정 게임 ID의 데이터만 삭제
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${GLOBAL_PREFIX}_`) && key.endsWith(`_${gameId}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      logger.info(`Cleared storage for game: ${gameId}`);
    } else {
      // 모든 gameplanner 관련 데이터 삭제
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(GLOBAL_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      logger.info('Cleared all storage');
    }
    return true;
  } catch (error) {
    errorHandler.handle(error, 'clearStorage');
    return false;
  }
}

/**
 * 스토리지 사용량 확인 (근사치)
 * @returns {Object} { used: number, total: number, percentage: number }
 */
export function getStorageInfo() {
  try {
    let totalSize = 0;
    let gameplannerSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        const size = new Blob([item]).size;
        totalSize += size;

        if (key.startsWith(GLOBAL_PREFIX)) {
          gameplannerSize += size;
        }
      }
    }

    // 일반적인 localStorage 한도는 5MB
    const quota = 5 * 1024 * 1024;

    return {
      used: totalSize,
      gameplannerUsed: gameplannerSize,
      total: quota,
      percentage: (totalSize / quota) * 100,
      usedMB: (totalSize / (1024 * 1024)).toFixed(2),
      gameplannerMB: (gameplannerSize / (1024 * 1024)).toFixed(2),
      totalMB: (quota / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    errorHandler.handle(error, 'getStorageInfo');
    return null;
  }
}

/**
 * 모든 gameplanner 키 목록 조회
 * @param {string} gameId - 특정 게임 ID만 조회 (선택사항)
 * @returns {Array<string>} 키 목록
 */
export function getAllKeys(gameId = null) {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GLOBAL_PREFIX)) {
        if (gameId) {
          if (key.endsWith(`_${gameId}`)) {
            keys.push(key);
          }
        } else {
          keys.push(key);
        }
      }
    }
    return keys;
  } catch (error) {
    errorHandler.handle(error, 'getAllKeys');
    return [];
  }
}

/**
 * 데이터 백업 (JSON 다운로드)
 * @param {string} gameId - 게임 ID (선택사항)
 */
export function backupData(gameId = null) {
  try {
    const keys = getAllKeys(gameId);
    const backup = {};

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          backup[key] = JSON.parse(value);
        } catch {
          backup[key] = value;
        }
      }
    });

    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `gameplanner_backup_${gameId || 'all'}_${timestamp}.json`;
    link.click();

    URL.revokeObjectURL(url);
    logger.info(`Data backed up: ${gameId || 'all'}`);
    return true;
  } catch (error) {
    errorHandler.handle(error, 'backupData');
    return false;
  }
}

/**
 * 데이터 복원 (JSON 파일에서)
 * @param {File} file - JSON 파일
 * @returns {Promise<boolean>} 성공 여부
 */
export async function restoreData(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    let restored = 0;
    Object.entries(data).forEach(([key, value]) => {
      try {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
        restored++;
      } catch (error) {
        logger.warn(`Failed to restore key: ${key}`, error);
      }
    });

    logger.info(`Data restored: ${restored} items`);
    return true;
  } catch (error) {
    errorHandler.handle(error, 'restoreData');
    return false;
  }
}

export default {
  getStorageKey,
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearStorage,
  getStorageInfo,
  getAllKeys,
  backupData,
  restoreData
};
