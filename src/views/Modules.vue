<template>
<v-container fluid grid-list-sm>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-card-title class="headline">Module list</v-card-title>
        <v-card-text>
          Can't find your module?
          <router-link :to="{name: 'Upload'}">
            Upload your timetable
          </router-link>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12 sm6 md4 v-for="(g, i) in modGroups" :key="i" :value="g.active">
      <v-card>
        <v-card-title class="title">{{ g.title }}</v-card-title>
        <v-list>
          <v-list-group v-for="m in g.modules" :key="m.code">
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>{{ m.title }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ m.code }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="s in m.sections" :key="s" @click="toggle(s)">
              <v-list-tile-content>
                <v-list-tile-title>{{ term[s].name }}</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon v-if="selected.indexOf(s) > -1">check_box</v-icon>
                <v-icon v-else>check_box_outline_blank</v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </v-list-group>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
const MOD_GROUPS = [
  [/^01/, 'General'],
  [/^02/, 'HASS'],
  [/^(03|10)/, 'Freshmore'],
  [/^20/, 'ASD'],
  [/^30/, 'EPD'],
  [/^40/, 'ESD'],
  [/^50/, 'ISTD']
]

const f = (s) => ((k) => s.test(k.code))

export default {
  data () {
    return {
    }
  },
  computed: {
    selected () {
      return this.$root.selected
    },
    term () {
      if (!this.$root.timetable.term) return {}
      const t = this.$root.timetable.term.join('-')
      return this.$root.timetable.sections[t]
    },
    modGroups () {
      const m = this.$root.timetable.modules || {}
      return MOD_GROUPS.map(([s, title]) => {
        const modules = Object.values(m).filter(f(s))
        return { title, modules, active: false }
      })
    }
  },
  methods: {
    toggle (c) {
      const i = this.selected.indexOf(c)
      if (i > -1) {
        this.selected.splice(i, 1)
      } else {
        this.selected.push(c)
      }
    }
  }
}
</script>
