import Vue from "vue";
import axios from "axios";

axios.defaults.baseURL = 'https://pokeapi.co/api/v2/'
Vue.prototype.$messenger = axios;
