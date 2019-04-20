import _ from 'lodash';
import Vue from 'vue';
import Web3 from 'web3';
// import makeDeferredPromise from 'defer-promise';
import { initializeStore, buildApiActions } from '@/lib/vuex-api';

const gameModule = {
  state: {
    game: {},
  },
  getters: {
    game: state => state.game,
  },
  ...buildApiActions({
    FETCH_GAME: {
      action: (ctx, payload) => ({
        method: 'get',
        url: `/games/${payload.id}`,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'game', response);
      },
    },
    // UPDATE_GAME: {
    //   action: (ctx, payload) => ({
    //     method: 'patch',
    //     url: `/users/${ctx.getters.authUserAddress}`,
    //     params: payload,
    //   }),
    //   mutation: (state, { response }) => {
    //     Vue.set(state, 'user', response);
    //   },
    // },
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
};

export default gameModule;
