import Vue from 'vue';
import Meta from 'vue-meta';

import App from './app.vue';
import router from './router';
import store from './store';

// register some global components
import './components/register-global-components';

Vue.config.productionTip = false;
Vue.use(Meta);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
