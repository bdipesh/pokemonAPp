<template>
  <v-row>
    <v-col cols="12" md="3">
      <v-card align="center">
        <v-col cols="12">
          <v-avatar size="100" color="grey" tile>
            <v-img
              :src="pokemonDetail.sprites.front_default"
              class="mx-auto"
            ></v-img>
          </v-avatar>
        </v-col>
        <v-col>
          <div class="">{{ `#${pokemonDetail.order}` }}</div>
          <div class="text-capitalize">{{ pokemonDetail.name }}</div>
          <v-row justify="center">
            <v-col
              v-for="(ability, index) in pokemonDetail.types"
              :key="index"
              class="py-0"
              cols="auto"
            >
              <v-chip
                small
                :color="$options.typesColor[ability.type.name]"
                class="text-capitalize"
                v-text="ability.type.name"
              ></v-chip>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="text-left">
          <v-list-item class="pl-0">
            <v-list-item-avatar class="mr-0">
              <v-icon small v-text="'mdi-information'"></v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="'Height'"></v-list-item-title>
              <v-list-item-subtitle>
                {{ pokemonDetail.height }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="pl-0">
            <v-list-item-avatar class="mr-0">
              <v-icon small v-text="'mdi-information'"></v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="'Weight'"></v-list-item-title>
              <v-list-item-subtitle>
                {{ pokemonDetail.weight }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col class="text-left">
          <div class="font-weight-bold title">
            <v-icon v-text="'mdi-chart-bar'"></v-icon>
            Stats
          </div>
          <v-row
            v-for="(stat, index) in pokemonDetail.stats"
            :key="index"
            align="center"
          >
            <v-col class="text-capitalize">{{ stat.stat.name }}</v-col>
            <v-col>
              <v-progress-linear
                :color="Object.values($options.typesColor)[index]"
                :value="stat.base_stat"
                height="10"
              ></v-progress-linear>
            </v-col>
          </v-row>
        </v-col>
      </v-card>
    </v-col>
    <v-col cols="12" md="9">
      <v-card>
        <v-tabs hide-slider>
          <v-tab
            v-for="tab in tabs.slice(0, 4)"
            :key="tab.title"
            class="text-capitalize"
            :active-class="menuItemActive ? `tab-text-color` : `blue--text`"
            @click="activeTab = tab.title"
          >
            <v-icon left small v-text="tab.icon"></v-icon>
            <span v-text="tab.title"></span>
          </v-tab>
        </v-tabs>
        <v-divider></v-divider>
        <component
          :is="components[activeTab]"
          :details="pokemonDetail"
        ></component>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import AbilityStat from "../../../components/PokemonsDetail/AbilityStat.vue";
import PokeMoves from "../../../components/PokemonsDetail/PokeMoves.vue";
import { mapGetters } from "vuex";
export default {
  components: {
    AbilityStat,
    PokeMoves,
  },
  typesColor: {
    normal: "green",
    water: "blue",
    flying: "cyan",
    poison: "orange",
    bug: "red",
    fire: "yellow",
  },
  data() {
    return {
      tabs: [
        { icon: "mdi-all-inclusive", title: "Ability" },
        { icon: "mdi-information-outline", title: "Moves" },
      ],
      activeTab: "Ability",
      components: {
        Ability: "ability-stat",
        Moves: "poke-moves",
      },
    };
  },
  computed: {
    ...mapGetters({
      pokemonDetail: "getPokemonDetail",
    }),
  },
};
</script>

<style scoped>
</style>