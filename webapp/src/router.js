import Vue from 'vue';
import Router from 'vue-router';

import HomePage from './pages/home.vue';
import AboutPage from './pages/about.vue';
import GamePage from './pages/games-id.vue';
import ProfilePage from './pages/profile.vue';
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
      path: '/games/:gameId', name: 'game', component: GamePage, props: true,
    },

    { path: '*', name: 'not-found', component: NotFoundPage },
  ],
});
