import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import Toast from 'vue3-toastify';
import router from './router'; // 라우터 설정 가져오기

const app = createApp(App);

app.use(createPinia()); // 상태 관리
app.use(router); // 라우터 추가

app.mount('#app');
