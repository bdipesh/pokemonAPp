<template>
    <v-hover
    >
        <v-card
                slot-scope="{ hover }"
                :flat="!hover"
                :box="hover"
                @click="openDetail"
        >
            <v-col
                    v-if="!loading"
                    class="blue-grey lighten-5"
            >
                <v-img
                        :src="pokemonOtherDetail.sprites.front_default"
                        contain
                        aspect-ratio="0.5"
                        height="200"
                ></v-img>
            </v-col>
            <v-skeleton-loader
                    v-else
                    class="mx-auto"
                    max-width="300"
                    type="image"
            ></v-skeleton-loader>
            <v-card-text class="font-weight-bold blue-grey--text">
                <v-row>
                    <v-col class="py-0" cols="12">
                        <v-row>
                            <v-col class="text-capitalize">
                                {{ details.name }}
                            </v-col>
                            <v-col class="text-right">
                                {{ `#${pokemonOtherDetail.order || ''}` }}
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col v-for="(ability, index) in pokemonOtherDetail.types"
                           :key="index"
                           class="py-0"
                           cols="auto">
                        <v-chip
                                small
                                :color="$options.typesColor[ability.type.name]"
                                class="text-capitalize"
                                v-text="ability.type.name"
                        ></v-chip>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-hover>
</template>
<script>
    import { mapMutations } from 'vuex'
 export default {
     props: {
         details: {
             type: Object,
             required: true
         },
     },
     typesColor: {
       normal: 'green',
       water: 'blue',
       flying: 'cyan',
       poison: 'orange',
       bug: 'red',
         fire: 'yellow'
     },
     data() {
         return {
             pokemonOtherDetail: {},
             loading: false
         }
     },
     created() {
         this.fetchPokemonDetails()
     },
     methods: {
         ...mapMutations({
            setPokemonDetail: 'setPokemonDetail'
         }),
         fetchPokemonDetails() {
             if(this.loading) return
             this.loading = true
             this.$messenger.get(this.details.url)
             .then(({data}) => {
                 this.pokemonOtherDetail = data
                 this.$nextTick(()=> {
                     this.$emit('details', [...data.types.map(x => x.type.name)])
                 })
             })
             .finally(()=> {
                 this.loading = false
             })
         },
         openDetail() {
            this.setPokemonDetail(this.pokemonOtherDetail)
             this.$router.push(`/pokemon/${this.pokemonOtherDetail.order}`)
         }
     },
 }
</script>