import Vue from 'vue'
import './plugins/vuetify'
import VueFire from 'vuefire'

import App from './App.vue'
import router from './router'
import firebase from './firebase'

Vue.config.productionTip = false
Vue.use(VueFire)

const data = {
  selected: []
}

new Vue({
  data,
  router,
  firebase,
  render: h => h(App)
}).$mount('#app')
