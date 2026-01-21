import logger from './logger';

/**
 * 에러 타입 정의
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  STORAGE: 'STORAGE_ERROR',
  CALCULATION: 'CALCULATION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 에러 핸들러 클래스
 */
class ErrorHandler {
  constructor() {
    this.errorCallbacks = [];
  }

  /**
   * 에러 핸들링
   */
  handle(error, context = '') {
    const errorInfo = this.normalizeError(error);

    logger.error(`Error in ${context}:`, {
      message: errorInfo.message,
      type: errorInfo.type,
      details: errorInfo.details,
      stack: errorInfo.stack
    });

    // 에러 콜백 실행
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo, context);
      } catch (e) {
        logger.error('Error in error callback:', e);
      }
    });

    return errorInfo;
  }

  /**
   * 에러 정규화
   */
  normalizeError(error) {
    if (error instanceof AppError) {
      return {
        message: error.message,
        type: error.type,
        details: error.details,
        stack: error.stack,
        timestamp: error.timestamp
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        type: ErrorTypes.UNKNOWN,
        details: null,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }

    return {
      message: String(error),
      type: ErrorTypes.UNKNOWN,
      details: null,
      stack: null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 에러 콜백 등록
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * 비동기 함수 래퍼
   */
  async wrapAsync(fn, context = '') {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context);
      throw error;
    }
  }

  /**
   * 동기 함수 래퍼
   */
  wrapSync(fn, context = '') {
    try {
      return fn();
    } catch (error) {
      this.handle(error, context);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
const errorHandler = new ErrorHandler();

// Vue 전역 에러 핸들러 설정
export function setupGlobalErrorHandler(app) {
  app.config.errorHandler = (err, instance, info) => {
    errorHandler.handle(err, `Vue Error Handler - ${info}`);
  };

  // 전역 Promise rejection 핸들러
  window.addEventListener('unhandledrejection', event => {
    errorHandler.handle(event.reason, 'Unhandled Promise Rejection');
  });
}

export default errorHandler;
