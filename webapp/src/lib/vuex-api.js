/* eslint-disable no-underscore-dangle */

import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

import api from './api';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

// TODO: clean these up remove when rest of actions are refactored
export const makeAsyncMutations = (type, mutation) => ({
  [`api-${type}`]: mutation || _.noop,
});
export const makeAsyncMutationTypes = name => name;

// generates an "action" that wraps the whole thing with mutations so we can
// get the status and errors for a request
// eslint-disable-next-line consistent-return
export const makeAsyncAction = (type, actionSpecFn) => async function (ctx, payload = {}) {
  const actionSpec = actionSpecFn(ctx, payload);
  actionSpec.payload = payload;
  // build a key for where to store the request status
  // some request statuses are segmented per ID or per some other param
  // while others are singular for that request type
  // ex: "user signup" (singular)
  // vs "add external account" (per type)
  // vs "update external account" (per type and ID)
  actionSpec.requestStatusKey = actionSpec.keyRequestStatusBy
    ? [type].concat(actionSpec.keyRequestStatusBy).join('/')
    : type;
  const { requestStatusKey } = actionSpec;
  ctx.commit('API_REQUEST_PENDING', { requestStatusKey }, { root: true });

  // adds a delay - sometimes helps give the backend time to process things
  // before making next request
  if (payload._delay) {
    await (timeout(payload._delay));
  }

  const {
    method, url, params, options, afterSuccess, afterFailure,
  } = actionSpec;
  try {
    const requestOptions = {
      method,
      url,
      ...method === 'get' ? { params } : { data: params },
      ...options,
    };
    const request = await api(requestOptions);
    await ctx.commit(`api-${type}`, {
      payload,
      actionSpec,
      response: request.data,
      responseTotalCount: request.headers['x-total-count'],
    });
    ctx.commit('API_REQUEST_SUCCESS', { requestStatusKey }, { root: true });
    if (typeof afterSuccess === 'function') afterSuccess(request.data);
    // option to return the response directly - used for things like fetching the file upload URL
    if (actionSpec.returnResponse) return request.data;
  } catch (err) {
    if (!err.response) {
      // assume request timed out
      ctx.commit('SHOW_API_ERROR_POPUP', 'timeout');
      return ctx.commit('API_REQUEST_FAILURE', { requestStatusKey, err: {} }, { root: true });
    }
    if (err.response.status >= 500) {
      ctx.commit('SHOW_API_ERROR_POPUP', err.response.status);
      // clear `err` object since we're displaying a popup instead of error message
      return ctx.commit('API_REQUEST_FAILURE', { requestStatusKey, err: {} }, { root: true });
    }

    ctx.commit('API_REQUEST_FAILURE', { requestStatusKey, err }, { root: true });
    // handle both v3 and v2 style errors
    const errorType = _.get(err, 'response.data.type') || _.get(err, 'response.data.error');
    // v3 admin deleted, v3 user is cancelled, v2 user is cancelled
    if (['AuthAdminDeleted', 'AuthUserCancelled', 'ACCOUNT_LOCKED'].includes(errorType)) {
      ctx.dispatch('logout');
    }
    if (typeof afterFailure === 'function') {
      afterFailure(err.response.data);
    }
  }
};

export function buildApiActions(apiActions, more = {}) {
  const types = {};
  const mutations = { ...more.mutations };
  const actions = { ...more.actions };
  _.each(apiActions, ({ action, mutation }, apiActionName) => {
    _.assign(mutations, makeAsyncMutations(apiActionName, mutation));
    actions[`api-${apiActionName}`] = makeAsyncAction(apiActionName, action);
  });
  return { mutations, actions };
}


// Vuex module to track all api request statuses
const apiRequestsStatusModule = {
  state: {
    statuses: {},
    // keyed by request type (and sometimes more)
    // each object having {status, error, requestedAt, receivedAt}
  },
  getters: {
    apiErrorCode: state => state.apiErrorCode,
    requestStatus: state => (name, param1, param2) => {
      let requestKey = name;
      if (param1) requestKey += `/${param1}`;
      if (param2) requestKey += `/${param2}`;
      const request = state.statuses[requestKey] || {};
      const statusProps = {
        wasRequested: !!request.requestedAt,
        isPending: request.status === 'PENDING',
        isPendingOrEmpty: !request.requestedAt || request.status === 'PENDING',
        isError: request.status === 'FAILURE',
        isSuccess: request.status === 'SUCCESS',
        error: request.error,
        receivedAt: request.receivedAt,

      };
      if (request.error) {
        statusProps.errorMessage = request.error.message || '';
        if (request.error.details && request.error.details.messages) {
          statusProps.errorMessages = request.error.details.messages;
        }
      }
      return statusProps;
    },
  },
  mutations: {
    HIDE_API_ERROR_POPUP: (state) => {
      Vue.delete(state, 'apiErrorCode');
    },
    SHOW_API_ERROR_POPUP: (state, errCode) => {
      Vue.set(state, 'apiErrorCode', errCode);
    },
    API_REQUEST_PENDING: (state, { requestStatusKey }) => {
      Vue.set(state.statuses, requestStatusKey, {
        status: 'PENDING',
        error: null,
        requestedAt: new Date(),
      });
    },
    API_REQUEST_FAILURE: (state, { requestStatusKey, err }) => {
      let errorResponse = 'Unknown error';
      if (err.response) errorResponse = err.response.data;
      if (errorResponse.error) errorResponse = errorResponse.error;
      Vue.set(state.statuses, requestStatusKey, {
        ...state.statuses[requestStatusKey],
        status: 'FAILURE',
        receivedAt: new Date(),
        // TODO: figure out if we can find any other weird errors
        error: errorResponse,
      });
    },
    API_REQUEST_SUCCESS: (state, { requestStatusKey }) => {
      Vue.set(state.statuses, requestStatusKey, {
        ...state.statuses[requestStatusKey],
        status: 'SUCCESS',
        receivedAt: new Date(),
      });
    },
  },
};

// function that maps request statuses easily
// be careful to not use arrow functions here as it is important that
// the function returned is called within the context of the component
export const mapRequestStatuses = function (mappings) {
  return _.mapValues(mappings, requestName => function () {
    // combines multiple request statuses into a single status
    if (_.isArray(requestName)) {
      const statuses = _.map(requestName, r => this.$store.getters.requestStatus(r));
      return {
        isPending: _.some(statuses, 'isPending'),
        isError: _.some(statuses, 'isError'),
        isSuccess: _.every(statuses, 'isSuccess'),
        error: _.find(_.map(statuses, 'error')),
        receivedAt: _.maxBy(statuses, 'receivedAt'),
      };
    } if (_.isFunction(requestName)) {
      // a function that returns an array to access params that are keyed
      return this.$store.getters.requestStatus(...requestName.apply(this));
    }
    return this.$store.getters.requestStatus(requestName);
  });
};


export function initializeStore(storeArgs) {
  /* eslint-disable no-param-reassign */
  storeArgs.modules = {
    ...storeArgs.modules,
    apiRequests: apiRequestsStatusModule,
  };

  const store = new Vuex.Store(storeArgs);
  store.dispatchApiAction = (actionName, payload) => store.dispatch(`api-${actionName}`, payload);
  return store;
}
