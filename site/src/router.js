import Vue from 'vue'
import Router from 'vue-router'

import Main from '@/views/Main'
import Upload from '@/views/Upload'
import Modules from '@/views/Modules'

Vue.use(Router)

export const routes = [
  {
    path: '/main',
    name: 'Main',
    component: Main
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/mods',
    name: 'Modules',
    component: Modules
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
