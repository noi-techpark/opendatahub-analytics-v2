// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createRouter, createWebHistory } from 'vue-router'

// Implement lazy loading for components
const MapView = () => import('../views/MapView.vue')
const ChartsView = () => import('../views/ChartsView.vue')
const EventsView = () => import('../views/EventsView.vue')
const AboutView = () => import('../views/AboutView.vue')
const ChartsAddEditView = () => import('../views/ChartsAddEditView.vue')
const EventsWeatherView = () => import('../views/EventsWeatherView.vue')

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
         component: ChartsAddEditView,
      },
      {
         path: '/charts/edit',
         name: 'charts-edit',
         component: ChartsAddEditView,
      },
      {
         path: '/events',
         name: 'events',
         component: EventsView,
      },
      {
         path: '/events/weather',
         name: 'events-weather',
         component: EventsWeatherView,
      },
      {
         path: '/about',
         name: 'about',
         component: AboutView,
      },
   ],
})

export default router
