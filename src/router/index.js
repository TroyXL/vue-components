import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/pages/Index'
import Scroll from '@/pages/Scroll'
import Markdown from '@/pages/Markdown'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'index',
    component: Index
  }, {
    path: '/scroll',
    name: 'scroll',
    component: Scroll
  }, {
    path: '/markdown',
    name: 'markdown',
    component: Markdown
  }]
})
