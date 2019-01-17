<template>
<div>
  <v-stepper v-model="step">
    <v-stepper-header>
      <v-stepper-step step="1" :complete="step > 1">Get Timetable</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="2" :complete="step > 2">Upload Timetable</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3">Complete</v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card>
          <v-card-title class="headline">Get Timetable File</v-card-title>
          <v-card-text>
            <v-container fluid grid-list-sm>
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-btn block :href="SAMS" target="_blank" @click.native="clikd = true">
                    1. Login to SAMS
                    <v-icon right>open_in_new</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-btn block :href="GBL" :disabled="!clikd" @click.prevent>
                    2. Right Click & Save
                    <v-icon right>file_download</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click.native="step = 2">I have it</v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>
      <v-stepper-content step="2">
        <v-card>
          <v-card-title class="headline">Upload Timetable</v-card-title>
          <v-card-text>
            <label>
              <div class="blue-grey white--text text-xs-center elevation-2 pa-3">
                Choose File
                <v-icon right dark>attach_file</v-icon>
              </div>
              <input id="file" type="file" @change="handleFile"/>
            </label>
          </v-card-text>
          <v-list dense v-if="processed.length > 0">
            <v-list-tile v-for="i in processed.modules" :key="i.code">
              <v-list-tile-content>
                <v-list-tile-title>{{ i.code }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ i.title }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-card-actions>
            <v-btn :disabled="sending" @click.native="step = 1">Back</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" :disabled="sending || !processed.length" @click.native="upload">
              Upload
              <v-icon right>cloud_upload</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>
      <v-stepper-content step="3">
        <v-card>
          <v-card-title class="headline">Thank You</v-card-title>
          <v-card-text>
            Your timetable has been submitted.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" :to="{name: 'Main'}">Go back</v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
  <v-dialog v-model="mobile">
    <v-card>
      <v-card-title class="headline">Mobile Browser detected</v-card-title>
      <v-card-text>
        Downloading HTML on mobile browsers is still wonky.
        You might have to use a desktop for this.
      </v-card-text>
      <v-card-actions>
        <v-btn @click.native="$router.go(-1)">Go back</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click.native="mobile = false">Continue</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar top :color="snack.color" v-model="snack.show">
    {{ snack.text }}
    <v-btn flat @click.native="snack.show = false">Close</v-btn>
  </v-snackbar>
</div>
</template>

<script>
import parse from '@/plugins/timetable'

const SAMS = 'https://sams.sutd.edu.sg/'
const GBL = 'psc/CSPRD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL'

export default {
  data () {
    return {
      processed: {},
      snack: { show: false, text: '' },
      GBL: SAMS + GBL, SAMS,
      sending: false,
      mobile: false,
      clikd: false,
      step: 1
    }
  },
  mounted () {
    this.mobile = /iP|Android/i.test(navigator.userAgent)
  },
  methods: {
    snackBar (text, color = 'error') {
      this.snack = {show: true, text, color}
    },
    upload () {
      this.sending = true
      const t = this.processed
      const ref = this.$root.$firebaseRefs.timetable
      const label = t.freshmore || t.sections.reduce((s, v) => s + v, 0)

      let mods = {}
      t.modules.forEach((m) => { mods[m.code.replace('.', '-')] = m })
      Promise.all([
        ref.child('modules').update(mods),
        ref.child('groups').update({[label]: t.sections}),
        ref.child('sections').child(t.term).update(t.schedules)
      ]).then(() => {
        this.$set(this.$root, 'selected', t.sections)
        this.sending = false
        this.step = 3
      })
    },
    handleFile (e) {
      this.processed = {}
      const f = e.target.files[0]
      if (!f) {
        return
      } else if (f.type && f.type !== 'text/html') {
        this.snackBar('The file is not a HTML file.')
        return
      } else if (f.size > 1000000) {
        this.snackBar('The file is too large.')
        return
      }
      const r = new FileReader()
      r.onload = (e) => {
        const processed = parse(e.target.result)
        if (processed.length === 0) {
          this.snackBar('Could not find anything.')
        } else {
          this.snackBar(`Found ${processed.length} modules`, 'success')
          this.processed = processed
        }
      }
      r.readAsText(f.slice(0, 1024 * 1024))
    }
  }
}
</script>

<style scoped>
input[type="file"] { display: none; }
</style>
