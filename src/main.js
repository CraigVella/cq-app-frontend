import '@mdi/font/scss/materialdesignicons.scss';
import Vue from 'vue'
import Buefy from 'buefy';
import './scss/buefy-custom.scss';

import VueMeta from 'vue-meta';

import CQApp from './CQApp.vue';

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator){
  // Inject service worker
  navigator.serviceWorker.register('/service-worker.js');
}

Vue.config.productionTip = false;
Vue.use(VueMeta);
Vue.use(Buefy);

new Vue({
  render: r => r(CQApp),
  metaInfo: {
    titleTemplate: 'Malverne Covid 19 Questionnaire%s'
}
}).$mount('#app');
