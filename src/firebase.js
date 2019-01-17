import firebase from 'firebase/app'
import 'firebase/database'

const pid = process.env.VUE_APP_FB_PROJECT

const config = {
  projectID: pid,
  storageBucket: `${pid}.appspot.com`,
  authDomain: `${pid}.firebaseapp.com`,
  apiKey: process.env.VUE_APP_FB_API_KEY,
  databaseURL: `https://${pid}.firebaseio.com`,
  messagingSenderId: process.env.VUE_APP_FB_SEND_ID
}
const fb = firebase.initializeApp(config)

export default {
  timetable: {
    asObject: true,
    source: fb.database().ref()
  }
}
