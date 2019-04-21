import _ from 'lodash';
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

    // listing lots of
    teams: {},
  },
  getters: {
    isUserLoggedIn(state, getters) {
      return getters.authUserAddress && getters.authUserSignedMessage && state.user.address;
    },
    user(state) { return state.user; },
    team(state) { return state.team; },

    teams(state) { return _.values(state.teams); },
    teamsById: state => state.teams,
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
    GET_ALL_TEAMS: {
      action: (ctx, teamId) => ({
        method: 'get',
        url: '/teams',
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'teams', _.keyBy(response, 'id'));
      },
    },
    GET_TEAM: {
      action: (ctx, teamId) => ({
        method: 'get',
        url: `/teams/${teamId}`,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'team', response);
      },
    },
    UPDATE_TEAM: {
      action: (ctx, payload) => ({
        method: 'patch',
        url: `/teams/${payload.id}`,
        params: payload,
      }),
      mutation: (state, { response }) => {
        Vue.set(state.teamDetails, 'team', response);
      },
    },
    JOIN_TEAM: {
      action: (ctx, payload) => ({
        method: 'post',
        url: `/teams/${ctx.state.team.id}/join`,
      }),
      mutation: (state, { response }) => {
        Vue.set(state, 'teamDetails', response);
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
    game: gameModule,
  },
  strict: process.env.NODE_ENV !== 'production',
});
window.store = store;

export default store;
