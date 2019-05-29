// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/*
import Vue from 'vue'
import router from './router'

new Vue({
  router,
  template: `
    <div id="app">
      <router-view class="view"></router-view>
    </div>
  `
}).$mount('#app')
*/

import Vue from 'vue';
//import VeeValidate from 'vee-validate';

//import { store } from './_store';
import { router } from './_helpers';
import App from './App';

//Vue.use(VeeValidate);

// setup fake backend
//import { configureFakeBackend } from './_helpers';
//configureFakeBackend();

new Vue({
    el: '#app',
    router,
    //store,
    render: h => h(App)
});