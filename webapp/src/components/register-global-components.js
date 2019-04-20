/*
  Globally register the components that are used everywhere just for convenience

  TODO: figure out what to do about the less common ones (address input, hellosign, etc)
*/

import Vue from 'vue';

Vue.component('form-group', require('./general/form-group').default);
Vue.component('form-input', require('./general/form-input').default);
Vue.component('form-input-option', require('./general/form-input-option').default);
Vue.component('form-row', require('./general/form-row').default);
Vue.component('save-bar', require('./general/save-bar').default);
Vue.component('v-button', require('./general/v-button').default);

// Vue.component('error-message', require('./general/error-message').default);
// Vue.component('icon', require('./general/icon').default);
// Vue.component('popup', require('./general/popup').default);
