import { createRouter, createWebHistory } from 'vue-router';

// 페이지 컴포넌트 임포트
import HomeView from '@/views/HomeView.vue';
import PlannerView from '@/views/PlannerView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView, // 홈 페이지
  },
  {
    path: '/planner',
    name: 'Planner',
    component: PlannerView, // 메인 Planner 페이지
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;