// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import ChartsView from '../views/ChartsView.vue'
import EventsView from '../views/EventsView.vue'
import AboutView from '../views/AboutView.vue'
import ChartsAddView from '../views/ChartsAddView.vue'

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
         path: '/charts/add',
         name: 'charts-add',
         component: ChartsAddView,
      },
      {
         path: '/events',
         name: 'events',
         component: EventsView,
      },
      {
         path: '/about',
         name: 'about',
         component: AboutView,
      },
   ],
})

export default router
