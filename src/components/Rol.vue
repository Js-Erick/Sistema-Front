<template>
    <v-layout align-start>
        <v-flex>
          <v-toolbar flat>
            <v-toolbar-title>Roles</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line hide-details></v-text-field>
            <v-spacer></v-spacer>
          </v-toolbar>
              <v-data-table :headers="headers" :items="roles" :search="search"  class="elevation-1">
                <template v-slot:top>
                  </template>
                  <template v-slot:item.condicion="{item}">
                      <template v-if="item.condicion">
                        <span class="blue--text">Activo</span>
                      </template>
                      <template v-else>
                      <span class="red--text">Inactivo</span>
                    </template>
                  </template>
                  
                  <template v-slot:no-data>
                      <v-btn color="primary" @click="listar">
                          Reset
                      </v-btn>
                  </template>
              </v-data-table>
        </v-flex> 
    </v-layout>      
</template>
<script>
  import axios from 'axios';
  export default {
    data: () => ({
      roles:[],
      dialog: false,
      headers: [
        { text: 'Nombre', value: 'nombre' },
        { text: 'Descripcion', value: 'descripcion',sortable: false },
        { text: 'Estado', value: 'condicion',sortable: false }
      ],
      search:'',
    }),

    computed: {
    },

    watch: {
    },

    created () {
      this.listar();
    },

    methods: {
      listar(){
                let me=this;
                axios.get('api/Roles/Listar').then(response=>{
                    //console.log(response);
                    me.roles=response.data;
                }).catch(error=>{
                    console.log(error);
                });
            },
       
   },
  }
</script>
