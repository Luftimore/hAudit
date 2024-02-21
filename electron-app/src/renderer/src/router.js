// router.js
import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router';

import MainMenu from './views/MainMenu.vue';
import NewAudit from './views/NewAudit.vue'

const routes = [
  { path: '/', component: MainMenu },  
  { path: '/new_audit', component: NewAudit }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
