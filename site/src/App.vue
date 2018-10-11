<template>
  <v-app :dark="dark">
    <NavBar @dark="dark = !dark"/>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  components: { NavBar },
  data () {
    return {
      dark: true
    }
  }
}
</script>
