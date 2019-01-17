<template>
<div>
  <v-toolbar app>
    <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title>SUTD Timetable</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-menu offset-y>
      <v-btn icon slot="activator">
        <v-icon>more_vert</v-icon>
      </v-btn>
      <v-list>
        <v-list-tile v-for="i in menu" :key="i.text" v-bind="i" @click="i.click">
          <v-list-tile-content v-text="i.text"></v-list-tile-content>
          <v-list-tile-action>
            <v-icon v-text="i.action"></v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
  <v-navigation-drawer clipped app v-model="drawer">
    <v-list>
      <v-list-tile v-for="i in links" :key="i.name" :to="i">
        <v-list-tile-action>
          <v-icon v-text="i.action"></v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title v-text="i.name"></v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</div>
</template>

<script>
const click = () => {}

export default {
  data () {
    return {
      drawer: false,
      menu: [
        {
					text: 'Dark Mode', action: 'brightness_4',
					click: () => this.$emit('dark')
        },
        {
					text: 'Source', action: 'open_in_new',
          target: '_blank',
          click, href: 'https://github.com/OpenSUTD/sutd-timetable'
				},
        {
					text: 'Back to v1', action: 'restore',
          click, href: 'https://sutd-timetable.herokuapp.com'
				}
      ],
      links: [
        { name: 'Main', action: 'dashboard' },
        { name: 'Modules', action: 'view_list' },
        { name: 'Upload', action: 'file_upload' }
      ]
    }
  }
}
</script>
