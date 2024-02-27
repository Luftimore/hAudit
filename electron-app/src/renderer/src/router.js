// router.js
import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router';

import MainMenu from './views/MainMenu.vue';
import NewAudit from './views/NewAudit.vue';
import Contacts from './views/Contacts.vue';
import SharedAudits from './views/SharedAudits.vue';
import LoadAudit from './views/LoadAudit.vue';
import ShareAudit from './views/ShareAudit.vue';

const routes = [
  { path: '/', component: MainMenu },  
  { path: '/new_audit', component: NewAudit },
  { path: '/contacts', component: Contacts},
  { path: '/shared_audits', component: SharedAudits},
  { path: '/load_audit', component: LoadAudit},
  { path: '/share_audit', component: ShareAudit}
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
