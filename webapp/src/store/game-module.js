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
    CREATE_GAME: {
      action: (ctx, payload) => ({
        method: 'post',
        url: '/games',
        params: payload,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'game', response);
      },
    },
    FETCH_GAME: {
      action: (ctx, gameId) => ({
        method: 'get',
        url: `/games/${gameId}`,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'game', response);
      },
    },
    BEGIN_GAME: {
      action: ctx => ({
        method: 'post',
        url: `/games/${ctx.state.game.channelId}/begin`,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'game', response);
      },
    },

    CREATE_PROPOSAL: {
      action: (ctx, payload) => ({
        method: 'post',
        url: `/games/${ctx.state.game.channelId}/proposals`,
        params: payload,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'game', response);
      },
    },
    VOTE_FOR_PROPOSAL: {
      action: (ctx, payload) => ({
        method: 'post',
        url: `/games/${ctx.state.game.channelId}/vote`,
        params: payload,
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
        url: `/games/${payload.id}/proposals`,
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
        console.log('UPDATE_GAME_PROPOSAL', response);
        // Vue.set(state, 'game', response);
      },
    },
    COMMIT_GAME_PROPOSAL: {
      action: (ctx, payload) => ({
        method: 'post',
        url: `/games/${payload.id}/commit`,
        params: payload,
      }),
      mutation: (state, { response }) => {
        console.log('COMMIT_GAME_PROPOSAL', response);
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
    },
    mutations: {
    },
  }),
};

export default gameModule;
