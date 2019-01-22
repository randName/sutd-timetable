import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const routes = [
  {
    path: '/main',
    name: 'Main',
    component: () => import(/* webpackChunkName: "main" */ '@/views/Main')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import(/* webpackChunkName: "uper" */ '@/views/Upload')
  },
  {
    path: '/mods',
    name: 'Modules',
    component: () => import(/* webpackChunkName: "mods" */ '@/views/Modules')
  },
  {
    path: '*',
    redirect: '/main'
  }
]

export default new Router({
  routes,
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
})
