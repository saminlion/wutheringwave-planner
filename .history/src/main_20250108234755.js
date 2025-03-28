import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import Toast from 'vue3-toastify';
import router from './router'; // 라우터 설정 가져오기
import 'vue3-toastify/dist/index.css';

const app = createApp(App);

app.use(createPinia()); // 상태 관리
app.use(router); // 라우터 추가
app.use(Toast, {
    autoClose: 3000,
    position: 'bottom-left',
});

app.mount('#app');
