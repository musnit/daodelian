import Vue from 'vue';
import Vuex from 'vuex';

import { initializeStore, buildApiActions } from '@/lib/vuex-api';

import metamaskModule from './metamask-module';

Vue.use(Vuex);

const store = initializeStore({
  state: {
    user: {},
    game: {},
    team: {},
  },
  getters: {
    isUserLoggedIn(state, getters) {
      return getters.authUserAddress && getters.authUserSignedMessage && state.user.address;
    },
    user(state) { return state.user; },
  },
  ...buildApiActions({
    FETCH_AUTH_USER: {
      action: (ctx, payload) => ({
        method: 'get',
        url: `/users/${ctx.getters.authUserAddress}`,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'user', response);
      },
    },
    UPDATE_USER: {
      action: (ctx, payload) => ({
        method: 'patch',
        url: `/users/${ctx.getters.authUserAddress}`,
        params: payload,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'user', response);
      },
    },
  }, {
    actions: {
      LOGOUT(ctx) {
        ctx.commit('LOGOUT');
        ctx.dispatch('clearMetamaskAuth');
      },
    },
    mutations: {
      LOGOUT(state) {
        state.user = {};
      },
    },
  }),
  modules: {
    metamask: metamaskModule,
  },
  strict: process.env.NODE_ENV !== 'production',
});
window.store = store;

export default store;
