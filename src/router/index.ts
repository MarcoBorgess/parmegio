import { createRouter, createWebHistory } from 'vue-router'
import BrainrotsView from '@/views/BrainrotsView.vue'
import RebirthsView from '@/views/RebirthsView.vue'
import MeusBrainrotsView from '@/views/MeusBrainrotsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/brainrots' },
    { path: '/brainrots', name: 'brainrots', component: BrainrotsView },
    { path: '/rebirths', name: 'rebirths', component: RebirthsView },
    { path: '/meus-brainrots', name: 'meus-brainrots', component: MeusBrainrotsView },
  ],
})

export default router
