import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import HomePage from "../pages/dashboard.vue";
import PokemonDetail from "../pages/pokemons/_id/index.vue";

const routes = [
  {
    path: "/",
    component: HomePage,
    meta: {
      middleware: [],
    },
  },
  {
    path: "/pokemon/:id",
    component: PokemonDetail,
    meta: {
      middleware: [],
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
