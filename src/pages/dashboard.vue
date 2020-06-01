<template>
   <v-row>
       <v-col cols="12">
           <v-row>
               <v-col
                v-for="(pokemon, index) in filteredList"
                :key="index"
                cols="12"
                md="3"
               >
                   <keep-alive>
                       <v-lazy>
                           <pokemon-card
                                   :details="pokemon"
                                   @update="pokemonList[index].types = [...$event]"
                           ></pokemon-card>
                       </v-lazy>
                   </keep-alive>
               </v-col>
           </v-row>
       </v-col>
       <v-col></v-col>
   </v-row>
</template>
<script>
import PokemonCard from "../components/PokemonCard";
import { mapGetters } from "vuex"
 export default {
     components: {PokemonCard},
     types: [
         { text: 'Normal', value: 'normal'},
         { text: 'Water', value: 'water'},
         { text: 'Flying', value: 'flying'},
         { text: 'Bug', value: 'bug'},
         { text: 'Fire', value: 'fire'}
     ],
     data() {
         return {
             pokemonList: [],
             filter: {
                 types: ''
             }
         }
     },
     computed:  {
         ...mapGetters({
             search: 'getSearchKey'
         }),
         filteredList () {
             return this.pokemonList.filter(pokemon => {
               return  pokemon.name.includes(this.search.toLowerCase())
             })
         }
},
     created () {
         this.getPokemonList()
     },
     methods: {
         getPokemonList() {
             this.$messenger.get(`/pokemon?offset=0&limit=100`)
             .then(({data}) => {
                 this.pokemonList = data.results
             })
         }
     },
 }
</script>