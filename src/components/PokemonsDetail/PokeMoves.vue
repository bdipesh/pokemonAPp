<template>
    <v-card flat>
        <v-card-text>
            <v-expansion-panels popout>
                <v-expansion-panel
                        v-for="(move,i) in details.moves"
                        :key="i"
                >
                    <v-expansion-panel-header class="text-capitalize">
                        <div>
                            {{ move.move.name }}
                        </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-row>
                            <v-col>
                              <v-data-table
                                      :items="move.version_group_details"
                                      :headers="headers"
                                      hide-default-footer
                              >
                                  <template
                                          slot="item"
                                          slot-scope="props"
                                  >
                                    <tr>
                                        <td> {{ props.item.level_learned_at}}</td>
                                        <td>{{ props.item.version_group.name}}</td>
                                        <td>{{ props.item.move_learn_method.name}}</td>
                                    </tr>
                                  </template>
                              </v-data-table>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>
<script>
    export default {
        props: {
            details: {
                type: Object,
                required: true
            },
        },
        data() {
            return {
                ability: '',
                headers: [
                    { text: 'Learn At Level', sortable: false},
                    { text: 'Version Group', sortable: false},
                    { text: 'category', sortable: false}
                ]
            }
        },
    }
</script>
