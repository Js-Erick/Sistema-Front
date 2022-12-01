<template>
    <v-layout align-start>
        <v-flex>
          <v-toolbar flat>
              <v-toolbar-title>Categorias</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line hide-details></v-text-field>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px"><!--Dialog Agregar y Editar-->
                  <template v-slot:activator="{ on, attrs }">
                      <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                          Nueva Categoria
                      </v-btn>
                  </template>
                  <v-card>
                      <v-card-title>
                          <span class="text-h5">{{ formTitle }}</span>
                      </v-card-title>

                      <v-card-text>
                          <v-container>
                              <v-row>
                                  
                                  <v-col cols="12" sm="12" md="12">
                                      <v-text-field v-model="nombre" label="Nombre"></v-text-field>
                                  </v-col>
                                  <v-col cols="12" sm="12" md="12">
                                      <v-text-field v-model="descripcion" label="Descripción"></v-text-field>
                                  </v-col>
                                  <v-col cols="12" sm="12" md="12" v-show="valida">
                                      <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v"></div>
                                  </v-col>

                                  
                              </v-row>
                          </v-container>
                      </v-card-text>

                      <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue darken-1" text @click="close">
                              Cancelar
                          </v-btn>
                          <v-btn color="blue darken-1" text @click="guardar">
                              Guardar
                          </v-btn>
                      </v-card-actions>
                  </v-card>
              </v-dialog>
              
              <v-dialog v-model="dialogDelete" max-width="500px"> <!--Dialog Eliminar-->
                  <v-card>
                      <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                      <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                          <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                          <v-spacer></v-spacer>
                      </v-card-actions>
                  </v-card>
              </v-dialog>    
          </v-toolbar>
              <v-data-table :headers="headers" :items="categorias" :search="search"  class="elevation-1">
                  <template v-slot:top>
                  </template>
                  <template v-slot:item.actions="{ item }">
                      <v-icon small class="mr-2" @click="editItem(item)">
                          edit
                      </v-icon>
                      <v-icon small @click="deleteItem(item)">
                          delete
                      </v-icon>
                  </template>
                  <template v-slot:no-data>
                      <v-btn color="primary">
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
      categorias:[],
      dialog: false,
      dialogDelete: false,
      headers: [
        
        { text: 'Nombre', value: 'nombre' },
        { text: 'Descripcion', value: 'descripcion',sortable: false },
        { text: 'Estado', value: 'condicion',sortable: false },
        { text: 'Opciones', value: 'actions', sortable: false },
      ],
      search:'',
      editedIndex: -1,
      
      id:0,
      nombre:'',
      descripcion:'',
      condicion:1,
      valida:0,
      validaMensaje:[]
     
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nueva Categoria' : 'Editar Categoria'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },

    created () {
      this.listar();
    },

    methods: {
      listar(){
        let me=this;
        axios.get('api/categorias/traerCategorias').then(function(response){

        for (var x = 0; x < response.data.length; x++) {

          var estado = ''
          if (response.data[x].condicion == true){
            estado = 'Activo'
          } else {
            estado = 'Inactivo'
          }
          console.log(estado)
          response.data[x].condicion = estado
         // for (response.data.length() )
          console.log(response.data[x].condicion); //response
          me.categorias=response.data;

        }

        }).catch(function(error){
          console.log(error)
        });
      },

      editItem (item) {
        this.id = item.id;
        this.nombre = item.nombre;
        this.descripcion = item.descripcion;
        this.editedIndex = 1;
        this.dialog = true
        
      },

      deleteItem (item) {
        this.editedIndex = this.desserts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        this.desserts.splice(this.editedIndex, 1)
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.limpiar();
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      limpiar(){
      this.id='';
      this.nombre='';
      this.descripcion='';
      this.editedIndex = -1;
      },

      guardar () {
         if(this.validar()){
            return;
         }
        if (this.editedIndex > -1) {
          //Editar
          let me=this;
          //console.log(this.id)
          axios.put('api/categorias/editarCategoria',{
            'id': this.id,
            'nombre' : this.nombre,
            'descripcion':this.descripcion,
            'condicion':this.condicion,
             
          }).then(function(res){
            console.log(res)
            me.close();
            me.listar();
            me.limpiar();
          }).catch(function(error){
              console.log(error);
          });
        } else {
          //Guardar
          //console.log(this.nombre)
          //console.log(this.descripcion)
          let me=this;
          axios.post('api/categorias/guardarCategoria',{
            'nombre' : this.nombre,
            'descripcion':this.descripcion,
            'condicion':this.condicion,
            
          }).then(function(res){
            console.log(res)
            me.close();
            me.listar();
            me.limpiar();
          }).catch(function(error){
              console.log(error);
          });
        }       
      },
      validar(){
        this.valida=0;
        this.validaMensaje=[];
        if(this.nombre.length<3 || this.nombre.length >50){
            this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos que 50")
        }
        if (this.validaMensaje.length){
          this.valida=1;
        }
        return this.valida;
    }  
   },
  }
</script>