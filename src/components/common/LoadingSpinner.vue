<template>
  <div v-if="show" :class="['loading-spinner', sizeClass, { overlay: overlay }]">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    overlay: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    sizeClass() {
      return `spinner-${this.size}`;
    }
  }
};
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-medium .spinner {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.spinner-large .spinner {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.loading-message {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.overlay .loading-message {
  color: white;
  font-size: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
