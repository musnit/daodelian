import Vue from 'vue';
import Vuex from 'vuex';

import { initializeStore, buildApiActions } from '@/lib/vuex-api';

import metamaskModule from './metamask-module';
import gameModule from './game-module';

Vue.use(Vuex);

const store = initializeStore({
  state: {
    user: {},
    game: {},
    team: {},
    web3instance: null,
  },
  getters: {
    isUserLoggedIn(state, getters) {
      return getters.authUserAddress && getters.authUserSignedMessage && state.user.address;
    },
    user: state => state.user,
    web3instance: state => state.web3instance,
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
      setRootWebThree(ctx, inst) {
        ctx.commit('SET_ROOT_WEBTHREE', inst);
      },
    },
    mutations: {
      LOGOUT(state) {
        state.user = {};
      },
      SET_ROOT_WEBTHREE(state, inst) {
        state.web3instance = inst;
      },
    },
  }),
  modules: {
    metamask: metamaskModule,
    game: gameModule,
  },
  strict: process.env.NODE_ENV !== 'production',
});
window.store = store;

export default store;
