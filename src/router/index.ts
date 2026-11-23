import { createRouter, createWebHistory } from 'vue-router'
import CarteView from '../views/CarteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'carte', component: CarteView }],
})

// Titre de page qui dit où l'on est (RGAA 8.6).
router.afterEach(() => {
  document.title = 'Carte des lieux — Places urgences'
})

export default router
