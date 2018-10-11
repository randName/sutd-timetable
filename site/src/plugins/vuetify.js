import Vue from 'vue'
import {
  Vuetify, VApp,
  VBtn, VIcon, VChip, VGrid,
  VCard, VMenu, VList, VDialog,
  VStepper, VDivider, VSubheader,
  VAutocomplete, VProgressCircular,
  VSnackbar, VToolbar, VNavigationDrawer
} from 'vuetify'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  components: {
    VApp,
    VBtn, VIcon, VChip, VGrid, 
    VCard, VMenu, VList, VDialog,
    VStepper, VDivider, VSubheader,
    VAutocomplete, VProgressCircular,
    VSnackbar, VToolbar, VNavigationDrawer
  }
})
