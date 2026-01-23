/**
 * 환경별 로깅 시스템
 * 개발 환경에서는 모든 로그 출력
 * 프로덕션 환경에서는 error만 출력
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.currentLevel = this.isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

    // 특정 메시지 패턴 필터링 (중복 방지)
    this.lastMessages = new Map();
    this.throttleTime = 1000; // 1초 내 같은 메시지 중복 방지
  }

  /**
   * 메시지 중복 체크
   */
  shouldLog(message) {
    const messageKey = typeof message === 'string' ? message : JSON.stringify(message);
    const now = Date.now();
    const lastTime = this.lastMessages.get(messageKey);

    if (lastTime && now - lastTime < this.throttleTime) {
      return false; // 중복 메시지 스킵
    }

    this.lastMessages.set(messageKey, now);
    return true;
  }

  /**
   * 에러 로그 (항상 출력)
   */
  error(message, ...args) {
    if (this.currentLevel >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${this.getTimestamp()}`, message, ...args);
    }
  }

  /**
   * 경고 로그 (개발 환경에서만)
   */
  warn(message, ...args) {
    if (this.currentLevel >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${this.getTimestamp()}`, message, ...args);
    }
  }

  /**
   * 정보 로그 (개발 환경에서만)
   */
  info(message, ...args) {
    if (this.currentLevel >= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${this.getTimestamp()}`, message, ...args);
    }
  }

  /**
   * 디버그 로그 (개발 환경에서만)
   */
  debug(message, ...args) {
    if (this.currentLevel >= LOG_LEVELS.DEBUG && this.shouldLog(message)) {
      console.log(`[DEBUG] ${this.getTimestamp()}`, message, ...args);
    }
  }

  /**
   * 타임스탬프 생성
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 그룹 로그 시작
   */
  group(label) {
    if (this.isDevelopment && console.group) {
      console.group(label);
    }
  }

  /**
   * 그룹 로그 종료
   */
  groupEnd() {
    if (this.isDevelopment && console.groupEnd) {
      console.groupEnd();
    }
  }

  /**
   * 성능 측정 시작
   */
  time(label) {
    if (this.isDevelopment && console.time) {
      console.time(label);
    }
  }

  /**
   * 성능 측정 종료
   */
  timeEnd(label) {
    if (this.isDevelopment && console.timeEnd) {
      console.timeEnd(label);
    }
  }
}

// 싱글톤 인스턴스 생성
const logger = new Logger();

export default logger;
