import _ from 'lodash';
import Vue from 'vue';
import makeDeferredPromise from 'defer-promise';
import Web3 from 'web3';

import { buildApiActions } from '../lib/vuex-api';

let web3instance;

let web3Interval;
let accountsInterval;
let networkInterval;

const NETWORK_NAMES = {
  1: 'MainNet',
  3: 'Ropsten',
  4: 'Rinkeby',
  42: 'Kovan',
};

const initialState = {
  error: null,
  networkId: null,
  address: null,
  signedMessage: null,
};

export default {
  state: _.clone(initialState),
  getters: {
    authUserAddress(state) { return state.address; },
    authUserSignedMessage(state) { return state.signedMessage; },
    metamaskAuthError(state) { return state.error; },
  },
  actions: {
    async initializeMetamaskVuex(ctx) {
      // new dapps
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        // Request account access if needed
        try {
          await window.ethereum.enable();
        } catch (error) { // User denied account access...
          ctx.commit('UPDATE_ERROR', 'DENIED_ACCESS');
          return;
        }
      } else if (window.web3) { // Legacy dapp browsers...
        window.web3 = new Web3(window.web3.currentProvider);
      } else { // Non-dapp browsers...
        ctx.commit('UPDATE_ERROR', 'NO_WEB3');
        return;
      }

      try {
        const localState = JSON.parse(localStorage.getItem('metamask-auth'));
        if (localState.signedMessage) {
          ctx.commit('RESTORE_STATE', localState);
        }
      } catch (err) {
        // do nothing

      }

      ctx.dispatch('checkWeb3');
      web3Interval = setInterval(() => ctx.dispatch('checkWeb3'), 5000);
    },
    async checkWeb3(ctx) {
      // console.log('check web3');
      if (ctx.state.error) return;

      // clearInterval(web3Interval);
      ctx.dispatch('checkWeb3Network');
      ctx.dispatch('checkWeb3Accounts');
    },
    async checkWeb3Accounts(ctx) {
      // console.log('check web3 accounts');
      const address = window.web3.eth.givenProvider.selectedAddress;
      if (address && ctx.state.address !== address) {
        ctx.commit('CLEAR_STATE');
      }
      ctx.commit('UPDATE_ADDRESS', window.web3.eth.givenProvider.selectedAddress);
    },
    async checkWeb3Network(ctx) {
      // console.log('check web3 network');
      ctx.commit('UPDATE_NETWORK', window.web3.eth.givenProvider.networkVersion);
    },
    async attemptLogin(ctx) {
      const deferred = makeDeferredPromise();
      try {
        window.web3.eth.givenProvider.sendAsync({
          method: 'eth_signTypedData',
          params: [
            [{
              type: 'string',
              name: 'Message',
              value: process.env.VUE_APP_AUTH_MESSAGE_TO_SIGN,
            }],
            ctx.state.address,
          ],
          from: ctx.state.address,
        }, (err, result) => {
          if (err) deferred.reject(err);
          else deferred.resolve(result);
        });

        const signingResult = await deferred.promise;
        await ctx.commit('UPDATE_SIGNED_MESSAGE', signingResult.result);
        localStorage.setItem('metamask-auth', JSON.stringify(ctx.state));
      } catch (err) {
        ctx.commit('UPDATE_ERROR', 'SIGNING_ERROR');
        console.log(err);
      }
    },
    async clearMetamaskAuth(ctx) {
      ctx.commit('CLEAR_STATE');
    },
  },
  mutations: {
    RESTORE_STATE(state, restoredState) {
      _.assign(state, restoredState);
    },
    CLEAR_STATE(state) {
      localStorage.removeItem('metamask-auth');
      state.signedMessage = null;
    },
    UPDATE_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_NETWORK(state, id) {
      state.network = id;
    },
    UPDATE_ADDRESS(state, address) {
      state.address = address;
      state.error = null;
    },
    UPDATE_SIGNED_MESSAGE(state, result) {
      state.signedMessage = result;
    },
  },
};
