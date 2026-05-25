import { ref, computed } from 'vue';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

const theme = ref(loadFromStorage('theme', 'system'));

function applyTheme(value) {
  const root = document.documentElement;
  if (value === 'dark') {
    root.classList.add('dark');
  } else if (value === 'light') {
    root.classList.remove('dark');
  } else {
    // system: follow OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

let systemWatcher = null;

export function useTheme() {
  const isDark = computed(() => {
    if (theme.value === 'dark') return true;
    if (theme.value === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    const order = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme.value);
    theme.value = order[(idx + 1) % order.length];
    saveToStorage('theme', theme.value);
    applyTheme(theme.value);
  };

  const setTheme = (value) => {
    theme.value = value;
    saveToStorage('theme', value);
    applyTheme(value);
  };

  const initTheme = () => {
    applyTheme(theme.value);

    if (!systemWatcher) {
      systemWatcher = window.matchMedia('(prefers-color-scheme: dark)');
      systemWatcher.addEventListener('change', () => {
        if (theme.value === 'system') applyTheme('system');
      });
    }
  };

  return { theme, isDark, toggleTheme, setTheme, initTheme };
}

export default useTheme;
