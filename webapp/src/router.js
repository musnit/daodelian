import Vue from 'vue';
import Router from 'vue-router';

import HomePage from './pages/home.vue';
import AboutPage from './pages/about.vue';
import ProfilePage from './pages/profile.vue';
import StarcraftPage from './pages/starcraft-id.vue';
import ChessPage from './pages/chess-id.vue';
import TeamPage from './pages/team.vue';
import NotFoundPage from './pages/404.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  // base: process.env.BASE_URL,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 };
  },
  routes: [
    // pages
    { path: '/', name: 'home', component: HomePage },
    { path: '/about', name: 'about', component: AboutPage },
    { path: '/profile', name: 'profile', component: ProfilePage },
    {
      path: '/team/:teamId', name: 'team', component: TeamPage, props: true,
    },
    {
      path: '/starcraft/:scId', name: 'starcraft', component: StarcraftPage, props: true,
    },
    {
      path: '/chess/:chessId', name: 'chess', component: ChessPage, props: true,
    },

    { path: '*', name: 'not-found', component: NotFoundPage },
  ],
});
