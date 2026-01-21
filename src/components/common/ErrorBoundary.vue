<template>
  <div v-if="error" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>

      <div class="error-details" v-if="showDetails && errorDetails">
        <button @click="toggleDetails" class="toggle-btn">
          {{ detailsExpanded ? '상세 정보 숨기기' : '상세 정보 보기' }}
        </button>
        <div v-if="detailsExpanded" class="details-content">
          <pre>{{ errorDetails }}</pre>
        </div>
      </div>

      <div class="error-actions">
        <button @click="handleRetry" class="btn btn-primary">다시 시도</button>
        <button @click="handleReset" class="btn btn-secondary">초기화</button>
        <button v-if="showBackButton" @click="handleGoBack" class="btn btn-secondary">
          뒤로 가기
        </button>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured, computed } from 'vue';
import { useRouter } from 'vue-router';
import logger from '@/utils/logger';
import errorHandler from '@/utils/errorHandler';

const props = defineProps({
  title: {
    type: String,
    default: '오류가 발생했습니다'
  },
  message: {
    type: String,
    default: '일시적인 문제가 발생했습니다. 다시 시도해주세요.'
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  onRetry: {
    type: Function,
    default: null
  },
  onReset: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['error', 'retry', 'reset']);

const router = useRouter();
const error = ref(null);
const errorDetails = ref('');
const detailsExpanded = ref(false);

onErrorCaptured((err, instance, info) => {
  error.value = err;
  errorDetails.value = `${err.message}\n\nComponent: ${instance?.$options?.name || 'Unknown'}\nInfo: ${info}\n\nStack:\n${err.stack}`;

  logger.error('Error captured in ErrorBoundary:', {
    error: err,
    component: instance?.$options?.name,
    info
  });

  errorHandler.handle(err, `ErrorBoundary - ${info}`);
  emit('error', err, instance, info);

  // true를 반환하여 에러 전파 중지
  return true;
});

const toggleDetails = () => {
  detailsExpanded.value = !detailsExpanded.value;
};

const handleRetry = async () => {
  if (props.onRetry) {
    try {
      await props.onRetry();
      error.value = null;
      errorDetails.value = '';
      detailsExpanded.value = false;
      emit('retry');
    } catch (err) {
      logger.error('Retry failed:', err);
    }
  } else {
    // 기본 동작: 페이지 새로고침
    window.location.reload();
  }
};

const handleReset = () => {
  if (props.onReset) {
    props.onReset();
  }
  error.value = null;
  errorDetails.value = '';
  detailsExpanded.value = false;
  emit('reset');
};

const handleGoBack = () => {
  router.back();
};
</script>

<style scoped>
.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.error-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-title {
  margin: 0 0 12px 0;
  color: #d32f2f;
  font-size: 24px;
  font-weight: 600;
}

.error-message {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 16px;
  line-height: 1.6;
}

.error-details {
  margin: 24px 0;
  text-align: left;
}

.toggle-btn {
  width: 100%;
  padding: 10px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #e0e0e0;
}

.details-content {
  margin-top: 12px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.details-content pre {
  margin: 0;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-secondary:hover {
  background: #616161;
}

@media (max-width: 640px) {
  .error-container {
    padding: 24px 16px;
  }

  .error-icon {
    font-size: 48px;
  }

  .error-title {
    font-size: 20px;
  }

  .error-message {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
