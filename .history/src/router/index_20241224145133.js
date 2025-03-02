import { createRouter, createWebHistory } from 'vue-router';

// 페이지 컴포넌트 임포트
import PlanView from '@/views/PlanView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: PlannerView, // 홈 페이지
  },
  {
    path: '/planner',
    name: 'Planner',
    component: PlanView, // 메인 Planner 페이지
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;