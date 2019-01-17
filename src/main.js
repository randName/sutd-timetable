import Vue from 'vue'
import './plugins/vuetify'

import App from './App.vue'
import router from './router'
import firebase from './firebase'

Vue.config.productionTip = false

const data = {
  selected: []
}

new Vue({
  data,
  router,
  firebase,
  render: h => h(App)
}).$mount('#app')
