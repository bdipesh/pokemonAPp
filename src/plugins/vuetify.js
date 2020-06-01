import '@mdi/font/css/materialdesignicons.css'
import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);
export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        baseColor: "#323541",
        primary: "#4964de", // indigo accent-2
        primaryLight: "#f7f9ff", // very-light-blue
        danger: "#E53935", // red darken-1
        shade: "#E0E0E0", // grey lighten-2
        blueGrey: "#334d6d"
      },
      dark: {
        baseColor: "#323541",
        primary: "#4964de",
        primaryLight: "#f7f9ff",
        danger: "#E53935",
        shade: "#E0E0E0",
        blueGrey: "#334d6d"
      }
    }
  }
});