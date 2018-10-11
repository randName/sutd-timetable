<template>
<v-container fluid grid-list-sm>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-card-title primary-title>
          <div class="headline">Welcome to SUTD Timetables!</div>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :to="{name: 'Upload'}">Upload Timetable</v-btn>
          <v-btn :to="{name: 'Modules'}">All modules</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <v-card-title class="headline">Module Search</v-card-title>
        <v-card-text>
          <v-autocomplete multiple dense chips clearable
            v-model="$root.selected"
            label="Find Sections"
            :items="items"
          >
            <template slot="selection" slot-scope="i">
              <v-chip close small :selected="i.selected" @input="remove(i)">
                {{ i.item.chip }}
              </v-chip>
            </template>
          </v-autocomplete>
          <v-subheader>Subscription URL</v-subheader>
          <code v-text="calURL"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :disabled="!$root.selected.length" @click.native="copyCal">
            Copy to Clipboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
  <v-snackbar bottom v-model="snack.show">
    {{ snack.text }}
    <v-btn flat color="pink" @click.native="snack.show = false">Close</v-btn>
  </v-snackbar>
</v-container>
</template>

<script>
const calDomain = 'https://us-central1-sutd-timetable.cloudfunctions.net'

export default {
  data () {
    return {
      snack: { text: '', show: false }
    }
  },
  computed: {
    term () {
      if (!this.$root.timetable.term) return ''
      return this.$root.timetable.term.join('-')
    },
    items () {
      if (!this.term) return []
      const term = this.$root.timetable.sections[this.term]
      const mods = this.$root.timetable.modules
      const divider = true

      return [].concat(...Object.values(mods).map((m) => {
        const header = `${m.code} - ${m.title}`
        return m.sections ? [
          { header },
          ...m.sections.map((value) => {
            const name = term[value].name
            return {
              value,
              chip: `${m.code}: ${name}`,
              text: `${name} (${header})`
            }
          }),
          { divider }
        ] : []
      }))
    },
    calURL () {
      const s = this.$root.selected
      const l = s.length > 0 ? s.sort().join(',') : ''
      return `${calDomain}/calendar?t=${this.term}&s=${l}`
    }
  },
  methods: {
    remove (i) {
      i.parent.selectItem(i.item)
    },
    copyCal () {
      const t = document.createElement('textarea')
      t.value = this.calURL
      document.body.appendChild(t)
      t.select()
      let suc = false
      try {
        suc = document.execCommand('copy')
      } catch (e) {
        // ignore
      }
      document.body.removeChild(t)
      this.snack.text = suc ? 'Copied to clipboard' : 'Could not copy'
      this.snack.show = true
    }
  }
}
</script>
