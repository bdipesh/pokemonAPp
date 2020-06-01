import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        searchKey: '',
        pokemonDetail: null
    },
    getters: {
        getSearchKey(state) {
            return state.searchKey;
        },
        getPokemonDetail(state) {
            return state.pokemonDetail
        }
    },
    mutations: {
        setSearchKey (state, payload) {
            state.searchKey = payload
        },
        setPokemonDetail(state, payload) {
            state.pokemonDetail = { ...payload }
        }
    }
});
