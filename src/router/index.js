import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PlannerView from '../views/PlannerView.vue';
import CharacterView from '../views/CharacterView.vue';
import InventoryView from '../views/InventoryView.vue';
import WeaponView from '../views/WeaponView.vue';
import SettingsView from '../views/SettingsView.vue';
import EndfieldDataView from '../views/EndfieldDataView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/planner',
    name: 'planner',
    component: PlannerView,
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryView,
  },
  {
    path: '/character',
    name: 'character',
    component: CharacterView,
  },
  {
    path: '/weapon',
    name: 'weapon',
    component: WeaponView,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
  },
  {
    path: '/endfield-data',
    name: 'endfield-data',
    component: EndfieldDataView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
