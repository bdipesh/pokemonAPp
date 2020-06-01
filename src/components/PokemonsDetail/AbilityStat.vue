<template>
    <v-card flat>
        <v-card-text>
                <v-alert
                        v-for="(item,i) in details.abilities"
                        :key="i"
                        class="text-capitalize"
                        color="blue-grey"
                        outlined
                >
                    <v-row align="center" dense>
                        <v-col>
                            {{ item.ability.name }}
                        </v-col>
                        <v-col>
                            <v-chip
                                    :color="item.is_hidden ? 'red' : 'green'"
                                    outlined
                            >
                                {{ item.is_hidden ? 'Hidden' : 'Not Hidden'}}
                            </v-chip>
                        </v-col>
                        <v-col>
                            #{{ item.slot }}
                        </v-col>
                    </v-row>
                </v-alert>
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
                ability: ''
            }
        },
    }
</script>
