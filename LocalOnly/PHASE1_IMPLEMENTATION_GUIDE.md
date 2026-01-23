# Phase 1 Implementation Guide

Phase 1 improvements are complete! This guide covers the implemented features and how to use them.

## Completed Features

### 1. Logging System Structure

**File:** `src/utils/logger.js`

Environment-aware logging system that controls log levels based on development/production mode.

- Development mode: All logs output (DEBUG, INFO, WARN, ERROR)
- Production mode: Only ERROR logs output

**Usage Example:**
```javascript
import logger from '@/utils/logger';

// Debug logs (development only)
logger.debug('User data:', userData);

// Info logs (development only)
logger.info('Processing started');

// Warning logs (development only)
logger.warn('Invalid input detected');

// Error logs (always output)
logger.error('Failed to save data', error);

// Performance measurement
logger.time('data-processing');
// ... execute task
logger.timeEnd('data-processing');

// Grouped logs
logger.group('Material Calculation');
logger.debug('Step 1:', data1);
logger.debug('Step 2:', data2);
logger.groupEnd();
```

### 2. Global Error Handler

**File:** `src/utils/errorHandler.js`

Global error handling system registered in main.js.

**Features:**
- Automatically catches Vue errors
- Handles unhandled Promise rejections
- Centralized error logging
- User-friendly error messages

**Usage:**
```javascript
import errorHandler from '@/utils/errorHandler';

// Handle errors in try-catch
try {
  await someOperation();
} catch (error) {
  errorHandler.handle(error, 'someOperation');
}

// Custom error listener
errorHandler.onError((error, context) => {
  console.log('Error occurred:', context, error);
});
```

### 3. Loading State Management

**File:** `src/composables/useLoading.js`

Composable for managing loading states during async operations.

**Usage:**
```javascript
import { useLoading } from '@/composables/useLoading';

const { isLoading, error, execute } = useLoading();

// Wrap async operations
const loadData = async () => {
  const result = await execute(async () => {
    const response = await fetch('/api/data');
    return response.json();
  }, 'loadData');

  // Result available after loading completes
  if (result) {
    console.log('Data loaded:', result);
  }
};
```

### 4. Loading Spinner Component

**File:** `src/components/common/LoadingSpinner.vue`

Globally registered loading spinner component.

**Usage:**
```vue
<template>
  <div>
    <!-- Simple usage -->
    <LoadingSpinner :show="isLoading" />

    <!-- With custom message -->
    <LoadingSpinner
      :show="isLoading"
      message="Calculating materials..."
    />

    <!-- With size -->
    <LoadingSpinner
      :show="isLoading"
      :size="64"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isLoading = ref(false);
</script>
```

### 5. LocalStorage Utilities

**File:** `src/utils/storage.js`

Safe localStorage wrapper with error handling.

**Features:**
- Automatic JSON serialization/deserialization
- Error handling for quota exceeded
- Backup and restore functionality
- Namespace support for multi-game data

**Usage:**
```javascript
import storage from '@/utils/storage';

// Save data
storage.saveToStorage('goals', goalsArray, 'wutheringwave');

// Load data
const goals = storage.loadFromStorage('goals', [], 'wutheringwave');

// Remove data
storage.removeFromStorage('goals', 'wutheringwave');

// Backup all data
const backup = storage.backup();

// Restore from backup
storage.restore(backup);
```

### 6. Data Backup Component

**File:** `src/components/common/DataBackup.vue`

UI component for backing up and restoring user data.

**Features:**
- Export data as JSON file
- Import data from JSON file
- Clear all data
- User confirmation for destructive operations

**Usage:**
```vue
<template>
  <div>
    <h2>Settings</h2>
    <DataBackup />
  </div>
</template>

<script setup>
import DataBackup from '@/components/common/DataBackup.vue';
</script>
```

---

## Integration Examples

### Example 1: Add Loading to Planner View

```vue
<template>
  <div>
    <LoadingSpinner :show="isCalculating" message="Calculating materials..." />

    <div v-if="!isCalculating">
      <!-- Your content -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLoading } from '@/composables/useLoading';

const { isLoading: isCalculating, execute } = useLoading();

const calculateMaterials = async () => {
  await execute(async () => {
    // Calculation logic here
  }, 'calculateMaterials');
};
</script>
```

### Example 2: Replace console.log with logger

```javascript
// Before
console.log('[Debug] Processing:', data);
console.error('Error:', error);

// After
import logger from '@/utils/logger';

logger.debug('Processing:', data);  // Only in development
logger.error('Error:', error);       // Always logged
```

### Example 3: Safe localStorage usage

```javascript
// Before - risky
try {
  const data = localStorage.getItem('key');
  this.data = data ? JSON.parse(data) : [];
} catch (error) {
  console.error('Failed:', error);
  this.data = [];
}

// After - safe
import storage from '@/utils/storage';

this.data = storage.loadFromStorage('data', [], 'wutheringwave');
```

---

## Best Practices

### 1. Use logger instead of console

Replace all console.log/warn/error with logger methods for better control.

### 2. Wrap async operations with useLoading

This provides automatic loading state management and error handling.

### 3. Use storage utilities for localStorage

This prevents quota errors and provides consistent error handling.

### 4. Show loading spinners for user actions

Improve UX by showing loading states during async operations.

### 5. Use error boundaries

The global error handler catches most errors, but add try-catch for critical operations.

---

## Migration Checklist

- [ ] Replace console.log with logger.debug
- [ ] Replace console.warn with logger.warn
- [ ] Replace console.error with logger.error
- [ ] Add LoadingSpinner to views with async operations
- [ ] Wrap async operations with useLoading
- [ ] Replace localStorage calls with storage utilities
- [ ] Add DataBackup component to settings page
- [ ] Test error handling in critical paths
- [ ] Verify loading states work correctly
- [ ] Check production build has no debug logs

---

## Testing

### Development Mode
```bash
npm run dev
```
- All logs should appear in console
- Loading spinners should work
- Error handling should catch and log errors

### Production Build
```bash
npm run build
npm run preview
```
- Only ERROR logs should appear
- Debug/Info/Warn logs should be suppressed
- Functionality should work identically

---

## Support

For detailed examples, see:
- **PHASE1_COMPLETE.md** - Overview and usage
- **QUICK_START.md** - Quick reference guide

For questions or issues, refer to the source code in:
- `src/utils/logger.js`
- `src/utils/errorHandler.js`
- `src/utils/storage.js`
- `src/composables/useLoading.js`
- `src/components/common/LoadingSpinner.vue`
- `src/components/common/DataBackup.vue`
