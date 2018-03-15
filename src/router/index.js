import Vue from 'vue'
import Router from 'vue-router'

import Scroll from '@/pages/Scroll'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'index',
    component: Scroll
  }]
})
