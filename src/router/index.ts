import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../views/MapView.vue';
import ChartsView from '../views/ChartsView.vue';
import EventsView from '../views/EventsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'map',
      component: MapView,
    },
    {
      path: '/charts',
      name: 'charts',
      component: ChartsView,
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView,
    },
  ],
});

export default router;
