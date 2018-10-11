import Vue from 'vue'
import VueFire from 'vuefire'
import firebase from 'firebase/app'
import 'firebase/database'

import config from '@/../firebaseconfig'

const fb = firebase.initializeApp(config)

Vue.use(VueFire)

export default {
  timetable: {
    asObject: true,
    source: fb.database().ref()
  }
}
