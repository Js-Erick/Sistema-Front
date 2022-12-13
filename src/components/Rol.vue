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
                axios.get('api/Roles/Listar').then(function(response){
                    //console.log(response);
                    me.roles=response.data;
                }).catch(function(error){
                    console.log(error);
                });
            },
      listar1(){
        let me=this;
        axios.get('api/Categorias/Listar').then(function(response){

       for (var x = 0; x < response.data.length; x++) {

          var estado = ''
          if (response.data[x].condicion == true){
            estado = 'Activo'
          } else {
            estado = 'Inactivo'
          }
          //console.log(estado)
          response.data[x].condicion = estado
         // for (response.data.length() )
         // console.log(response.data[x].condicion); //response
          me.categorias=response.data;

        }

        }).catch(function(error){
          console.log(error)
        });
      }
       
   },
  }
</script>
