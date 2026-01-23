import { ref } from 'vue';
import errorHandler from '@/utils/errorHandler';

/**
 * 로딩 상태 관리 Composable
 */
export function useLoading(initialState = false) {
  const isLoading = ref(initialState);
  const error = ref(null);

  /**
   * 비동기 작업 실행 (자동 로딩 상태 관리)
   */
  const execute = async (asyncFn, context = 'Loading') => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      error.value = errorHandler.handle(err, context);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 로딩 상태 초기화
   */
  const reset = () => {
    isLoading.value = false;
    error.value = null;
  };

  return {
    isLoading,
    error,
    execute,
    reset
  };
}

/**
 * 전역 로딩 상태 (싱글톤)
 */
const globalLoading = ref(false);
const globalLoadingCount = ref(0);

export function useGlobalLoading() {
  const start = () => {
    globalLoadingCount.value++;
    globalLoading.value = true;
  };

  const stop = () => {
    globalLoadingCount.value = Math.max(0, globalLoadingCount.value - 1);
    if (globalLoadingCount.value === 0) {
      globalLoading.value = false;
    }
  };

  const execute = async (asyncFn, context = 'Global Loading') => {
    start();
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      errorHandler.handle(err, context);
      throw err;
    } finally {
      stop();
    }
  };

  return {
    isLoading: globalLoading,
    start,
    stop,
    execute
  };
}
