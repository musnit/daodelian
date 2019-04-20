/* eslint-disable no-param-reassign */

import Axios from 'axios';

const api = Axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
  },
});
window.api = api; // useful for dev

api.interceptors.request.use((config) => {
  const address = window.store.getters.authUserAddress;
  const signedMessage = window.store.getters.authUserSignedMessage;
  if (address && signedMessage) {
    config.headers.Authorization = `Basic ${btoa(`${address}:${signedMessage}`)}`;
  }

  return config;
});

export default api;
