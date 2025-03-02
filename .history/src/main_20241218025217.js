import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router'; // 라우터 설정 (선택사항)
import './assets/main.css'; // 전역 CSS 파일

const app = createApp(App);

app.use(createPinia()); // Pinia 상태 관리 사용
app.use(router); // Vue Router 사용 (선택사항)

app.mount('#app');