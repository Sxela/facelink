import Vue from 'vue';
import Router from 'vue-router';

import ImageInput from '../views/ImageInput'
import VideoInput from '../views/VideoInput'
import AddDescriptors from '../views/AddDescriptors'

Vue.use(Router);

export const router = new Router({
  mode: 'history',
  routes: [
    { path: '/photo', component: ImageInput },
    { path: '/camera', component: VideoInput },
    { path: '/upload', component: AddDescriptors },
    { path: '/', redirect: '/camera' }
    // otherwise redirect to home
  ],
  linkActiveClass: "active"
});