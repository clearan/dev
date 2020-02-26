import Vue from 'vue'
import axios from 'axios'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import {get, post} from '@/utils/request'
import '@/icons' // icon
import '@/utils/global'//全局
import '@/permission' // permission control

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */

//将axios封装加入到Vue 原型里 直接this.$http.get调用
Vue.prototype.$http = {
  get,
  post
}
Vue.prototype.url = 'http://10.10.35.165:8082/cgi'
Vue.prototype.url2 = 'http://10.10.35.165:8080/cgi'

import {mockXHR} from '../mock'
// if (process.env.NODE_ENV === 'production') {
//   mockXHR()
// }

// set ElementUI lang to EN
//Vue.use(ElementUI, {locale})
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.config.productionTip = false

//在main.js设置全局的请求次数，请求的间隙
// axios.defaults.retry = 4;
// axios.defaults.retryDelay = 1000;
// axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
//   var config = err.config;
//   // If config does not exist or the retry option is not set, reject
//   if(!config || !config.retry) return Promise.reject(err);
//   // Set the variable for keeping track of the retry count
//   config.__retryCount = config.__retryCount || 0;
//   // Check if we've maxed out the total number of retries
//   if(config.__retryCount >= config.retry) {
//     // Reject with the error
//     return Promise.reject(err);
//   }
//   // Increase the retry count
//   config.__retryCount += 1;
//   // Create new promise to handle exponential backoff
//   var backoff = new Promise(function(resolve) {
//     setTimeout(function() {
//       resolve();
//     }, config.retryDelay || 1);
//   });
//   // Return the promise in which recalls axios to retry the request
//   return backoff.then(function() {
//     return axios(config);
//   });
// });

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
