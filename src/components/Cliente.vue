<template>
    <v-layout align-start>
        <v-flex>
          <v-toolbar flat>
            <v-toolbar-title>Clientes</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line hide-details></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                        Nuevo Cliente
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

                                <v-col cols="12" sm="6" md="6">
                                    <v-select v-model="tipoDocumento" :items="documentos" label="Tipo Documento"></v-select>
                                </v-col>
                                
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field  v-model="numDocumento" label="Numero Documento"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12">
                                    <v-text-field  v-model="direccion" label="Direccion"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field v-model="email" label="Email"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field v-model="telefono" label="Telefono"></v-text-field>
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
          </v-toolbar>
              <v-data-table :headers="headers" :items="clientes" :search="search"  class="elevation-1">
                  <template v-slot:top>
                  </template>
                  <template v-slot:item.actions="{ item }">
                          <v-icon small class="mr-2" @click="editItem(item)">
                              edit
                          </v-icon>                       
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
      clientes:[],
      dialog: false,
      adModal:0,
      adAccion:0,
      adNombre:'',
      adId:'',
      dialogDelete: false,
      valida:0,
      validaMensaje:[],
      search:'',
      editedIndex: -1,
      headers: [
        { text: 'Nombre', value: 'nombre' },
        { text: 'Tipo Persona', value: 'tipoPersona'},
        { text: 'Tipo Documento', value: 'tipoDocumento'},
        { text: 'Numero Documento', value: 'numDocumento',sortable:false},
        { text: 'Dirección', value: 'direccion',sortable:false },
        { text: 'Teléfono', value: 'telefono',sortable: false },
        { text: 'Email', value: 'email',sortable: false },
        { text: 'Opciones', value: 'actions', sortable: false },
      ],

      id:0,
      nombre:null,
      descripcion:null,
      documentos:['Dni','Cedula','Pasaporte'],
      tipoDocumento:null,
      numDocumento:null,
      direccion:null,
      telefono:null,
      email:null,
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Cliente' : 'Editar Cliente'
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
        listar() {
            let me = this;
            axios.get('api/Personas/ListarClientes').then(function (response) {
              console.log(response);
              me.clientes = response.data;
            }).catch(function (error) {
              console.log(error);
            });
            }, 
      
     
      editItem (item) {
        
        this.id = item.idpersona;
        this.nombre=item.nombre;
        this.tipoDocumento=item.tipoDocumento;
        this.numDocumento=item.numDocumento;
        this.direccion = item.direccion;
        this.telefono = item.telefono;
        this.email = item.email;
        this.editedIndex = 1;
        this.dialog = true
        
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
      this.tipoDocumento='';
      this.numDocumento='';
      this.direccion= '';
      this.telefono='';
      this.email='';
      this.editedIndex = -1;
      },

      guardar () {
         if(this.validar()){
            return;
         }
        if (this.editedIndex > -1) {
          //Editar
          let me=this;
        
          console.log(this.id)
          axios.put('api/Personas/Actualizar',{
          'idpersona': me.id,
          'tipoPersona':'Cliente',
          'nombre': me.nombre,
          'tipoDocumento':me.tipoDocumento,
          'numDocumento': me.numDocumento,
          'direccion': me.direccion,
          'telefono': me.telefono,
          'email': me.email,
         
                
          }).then(function(res){
            console.log(res)
            me.close();
            me.listar();
            me.limpiar();
          }).catch(function(error){
              console.log(error);
          });
          console.log(this.id)
        } else {
          //Guardar
          //console.log(this.nombre)
         
          let me=this;
          axios.post('api/Personas/Crear',{
            'tipoPersona': 'Cliente',
            'nombre': me.nombre,
            'tipoDocumento':me.tipoDocumento,
            'numDocumento': me.numDocumento,
            'direccion': me.direccion,
            'telefono': me.telefono,
            'email': me.email,
            
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
        if(this.nombre.length<3 || this.nombre.length >100){
            this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos que 100.")
        }
       
        if(!this.tipoDocumento){
            this.validaMensaje.push("Selecione un tipo de documento.")
        }
        
     
        if (this.validaMensaje.length){
          this.valida=1;
        }
        return this.valida;
      },

       
   },
  }
</script>
