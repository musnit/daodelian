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
    FETCH_GAME_PROPOSALS: {
      action: (ctx, payload) => ({
        method: 'get',
        url: `/games/${payload.id}/proposals/${payload.proposedIdx}`,
      }),
      mutation: (state, { response }) => {
        console.log('response', response);
        // Vue.set(state, 'game', response);
      },
    },
    ADD_GAME_PROPOSAL: {
      action: (ctx, payload) => ({
        method: 'post',
        url: `/games/${payload.id}/proposals/${payload.proposedIdx}`,
        params: payload,
      }),
      mutation: (state, { response }) => {
        console.log('response', response);
        // Vue.set(state, 'game', response);
      },
    },
    UPDATE_GAME_PROPOSAL: {
      action: (ctx, payload) => ({
        method: 'post',
        url: `/games/${payload.id}/proposals/${payload.proposedIdx}`,
        params: payload,
      }),
      mutation: (state, { response }) => {
        console.log('response', response);
        // Vue.set(state, 'game', response);
      },
    },
    DELETE_GAME_PROPOSALS: {
      action: (ctx, payload) => ({
        method: 'delete',
        url: `/games/${payload.id}/proposals`,
        params: payload,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'game', response);
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
};

export default gameModule;
