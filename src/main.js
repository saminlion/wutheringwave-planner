import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import Toast from 'vue3-toastify';
import router from './router';
import { setupGlobalErrorHandler } from './utils/errorHandler';
import LoadingSpinner from './components/common/LoadingSpinner.vue';
import 'vue3-toastify/dist/index.css';

// Game plugins
import wutheringwavePlugin from './games/wutheringwave';
import endfieldPlugin from './games/endfield';
import { useGameRegistryStore } from './store/gameRegistry';

const app = createApp(App);

// Global error handler
setupGlobalErrorHandler(app);

// Global components
app.component('LoadingSpinner', LoadingSpinner);

// State management
const pinia = createPinia();
app.use(pinia);

// Register games in the registry
const gameRegistry = useGameRegistryStore();
gameRegistry.registerGame(wutheringwavePlugin);
gameRegistry.registerGame(endfieldPlugin);
gameRegistry.hydrate(); // Restore last selected game

// Router
app.use(router);

// Toast notifications
app.use(Toast, {
    autoClose: 3000,
    position: 'bottom-left',
});

app.mount('#app');
