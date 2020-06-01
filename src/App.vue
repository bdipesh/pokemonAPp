<template>
  <v-app id="app">
      <v-app-bar
              color="blue-grey"
              dark
              app
              flat
              short
      >
          <div @click="$router.push('/')">Pokemon App</div>
          <v-spacer></v-spacer>
          <v-text-field
                  v-model="search"
                  class="mt-6 hidden-sm-and-down"
                  label="Search Pokemon with name."
                  solo
                  flat
                  dense
                  rounded
                  light
                  append-icon="mdi-magnify"
          ></v-text-field>
          <v-spacer></v-spacer>
      </v-app-bar>
    <v-content >
        <v-container >
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
  name: 'App',
    data() {
        return {
            search: ''
        }
    },
    watch: {
      search () {
          this.setSearchKey(this.search || '')
          this.$route.push('/')
        }
    },
    created() {
        this.setSearchKey('')
    },
    methods: {
        ...mapMutations({
            setSearchKey: 'setSearchKey'
        })
    },
  
}
</script>

