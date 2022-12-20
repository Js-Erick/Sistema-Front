<template>
    <v-layout align-start>
        <v-flex>
          <v-toolbar flat>
            <v-toolbar-title>Ingresos</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line hide-details></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                        Nuevo
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row>
                               <v-col cols="12" sm="6" md="6">
                                    <v-text-field v-model="nombre" label="Nombre"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-select v-model="idrol" :items="roles" label="Rol"></v-select>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-select v-model="tipoDocumento" :items="documentos" label="Tipo Documento"></v-select>
                                </v-col>
                                
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field  v-model="numDocumento" label="Numero Documento"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field  v-model="direccion" label="Direccion"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field v-model="email" label="Email"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field v-model="telefono" label="Telefono"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field type="password" v-model="password" label="Password"></v-text-field>
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
            <v-dialog v-model="adModal" max-width="500px">
                <v-card>
                    <v-card-title class="text-h5" v-if="adAccion==1">¿Activar Item?</v-card-title>
                    <v-card-title class="text-h5" v-if="adAccion==2">¿Desactivar Item?</v-card-title>
                    <v-card-text>
                        Estás a punto de
                        <span v-if="(adAccion==1)">Activar</span>
                        <span v-if="(adAccion==2)">Desactivar</span>
                        el ítem {{adNombre}}
                      </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text  @click="activarDesactivarCerrar">Cancelar</v-btn>
                        <v-btn v-if = "(adAccion==1)" color="red darken-1" text  @click="activar">Activar</v-btn>
                        <v-btn v-if = "(adAccion==2)" color="red darken-1" text  @click="desactivar">Desactivar</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
          </v-toolbar>
              <v-data-table :headers="headers" :items="ingresos" :search="search"  class="elevation-1">
                  <template v-slot:top>
                  </template>
                  <template v-slot:item.estado="{item}">
                      <template v-if="item.estado">
                        <span class="blue--text">Aceptado</span>
                      </template>
                      <template v-else>
                      <span class="red--text">{{item.estado}}</span>
                    </template>
                  </template>
                  <template v-slot:item.actions="{ item }">
                          <v-icon small class="mr-2" @click="editItem(item)">
                              edit
                          </v-icon>
                          <template v-if="item.estado == 'Aceptado'">
                          <v-icon small @click="activarDesactivarMostrar(2,item)">
                              block
                          </v-icon>
                        </template>
                      <template v-else>
                          <v-icon small @click="activarDesactivarMostrar(1,item)">
                              check
                          </v-icon>
                        </template>
                </template>
                  <template v-slot:no-data>
                      <v-btn color="primary" @click="listar">
                          Reset
                      </v-btn>
                  </template>
              </v-data-table>
              <v-spacer></v-spacer>
              <v-container grid-list-sm class="pa-4 white">
                <v-layout row wrap>
                  <v-flex xs12 sm4 md4 xl4>
                    <v-select v-model="tipoComprobante" :items="comprobantes" label="Tipo Comprobante">
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm4 md4 xl4>
                    <v-text-field v-model="serieComprobante" label="Serie Comprobante" >
                    </v-text-field>
                  </v-flex>
                  <v-flex xs12 sm4 md4 xl4>
                    <v-text-field v-model="numComprobante" label="Número Comprobante" >
                    </v-text-field>
                  </v-flex>
                  <v-flex xs12 sm4 md4 xl4>
                    <v-select v-model="idProveedor" :items="proveedores" label="Proveedor">
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm4 md4 xl4>
                    <v-text-field type="number" v-model="impuesto" label="Impuesto" >
                    </v-text-field>
                  </v-flex>
                  <v-flex xs12 sm8 md8 l8 xl8>
                    <v-text-field v-model="codigo" label="Código" >
                    </v-text-field>
                  </v-flex>
                  <v-flex xs12 sm2 md2 xl2>
                    <v-btn small fab dark color ="teal">
                      <v-icon dark>list</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs12 sm12 md12 xl12>
                   
                  </v-flex>
                </v-layout>
              </v-container>
        </v-flex> 
    </v-layout>      
</template>
<script>
  import axios from 'axios';
  export default {
    data: () => ({
      ingresos:[],
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
        { text: 'Usuario', value: 'idusuarioNavigation.nombre'},
        { text: 'Proveedor', value: 'idproveedorNavigation.nombre'},
        { text: 'Tipo Comprobante', value: 'tipoComprobante'},
        { text: 'Serie Comprobante', value: 'serieComprobante',sortable: false},
        { text: 'Numero Comprobante', value: 'numComprobante',sortable: false },
        { text: 'Impuesto', value: 'impuesto',sortable: false },
        { text: 'Total', value: 'total',sortable: false },
        { text: 'Fecha', value: 'fechaHora',sortable: false },
        { text: 'Estado', value: 'estado',sortable: false },
        { text: 'Opciones', value: 'actions', sortable: false },
      ],

      id:0,
      condicion:true,
      idproveedor:0,
      proveedores:[],
      comprobantes:['Factura','Boleta','Ticket','Guia'],
      tipoComprobante:null,
      serieComprobante:null,
      numComprobante:null,
      telefono:null,
      impuesto:18,
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Usuario' : 'Editar Usuario'
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
      this.select();
    },

        methods: {
        listar() {
            let me = this;
            axios.get('api/Ingresos/Listar').then(function (response) {
              console.log(response);
              me.ingresos = response.data;
            }).catch(function (error) {
              console.log(error);
            });
            },
        select() {
          let me = this;
          let proveedoresArray = []
          axios.get('api/Personas/SelectProveedores').then(function (response) {
            //console.log(response);
              proveedoresArray = response.data,
              proveedoresArray.map(function (x) {
                me.proveedores.push({ text: x.nombre, value: x.idpersona })
              });
          }).catch(function (error) {
            console.log(error);
          });
        },      

      listar1(){
        let me=this;
        axios.get('api/Articulos/Listar').then(function(response){

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
      },
     
      editItem (item) {
        //console.log(this.id); 
        this.id = item.idusuario;
        this.idrol=item.idrol;
        this.nombre=item.nombre;
        this.tipoDocumento=item.tipoDocumento;
        this.numDocumento=item.numDocumento;
        this.direccion = item.direccion;
        this.telefono = item.telefono;
        this.email = item.email;
        this.password = item.passwordHash;
        this.passwordAnt =item.passwordHash;
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
      this.password='';
      this.passwordAnt='';
      this.act_Password=false
      this.editedIndex = -1;
      },

      guardar () {
         if(this.validar()){
            return;
         }
        if (this.editedIndex > -1) {
          //Editar
          let me=this;
          if(me.password!=me.passwordAnt){
            me.act_Password=true
          }
          console.log(this.id)
          axios.put('api/Usuarios/Actualizar',{
            'idusuario': me.id,
            'idrol': me.idrol,
            'nombre': me.nombre,
            'tipoDocumento':me.tipoDocumento,
            'numDocumento': me.numDocumento,
            'direccion': me.direccion,
            'telefono': me.telefono,
            'email': me.email,
            'password' : me.password,
            'act_password': me.act_Password
             
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
          axios.post('api/Usuarios/Crear',{
            'idrol': me.idrol,
            'nombre': me.nombre,
            'tipoDocumento':me.tipoDocumento,
            'numDocumento': me.numDocumento,
            'direccion': me.direccion,
            'telefono': me.telefono,
            'email': me.email,
            'password' : me.password
            
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
        if(!this.idrol){
            this.validaMensaje.push("Selecione un rol.")
        }
        if(!this.tipoDocumento){
            this.validaMensaje.push("Selecione un tipo de documento.")
        }
        
        if(!this.email){
            this.validaMensaje.push("Ingresar mail del usuario.")
        }
        if(!this.password){
            this.validaMensaje.push("Ingresar password del usuario.")
        }
        if (this.validaMensaje.length){
          this.valida=1;
        }
        return this.valida;
      },
      activar(){
          let me=this;
          axios.put('api/Usuarios/Activar/'+this.adId,{}).then(function(response){
              me.adModal=0;
              me.adAccion=0;
              me.adNombre="";
              me.adId="";
              me.listar();                       
          }).catch(function(error){
              console.log(error);
          }); 
        },
      desactivar(){
        let me=this;
          axios.put('api/Usuarios/Desactivar/'+this.adId,{}).then(function(response){
              me.adModal=0;
              me.adAccion=0;
              me.adNombre="";
              me.adId="";
              me.listar();                       
          }).catch(function(error){
              console.log(error);
          });
        },    
      activarDesactivarMostrar(accion,item){
        this.adModal=1;
        this.adNombre=item.nombre;
        this.adId=item.idusuario;
        if(accion==1){
          
        this.adAccion=1;
        }
        else if (accion == 2){
          
         this.adAccion=2;
        }
        else{ 
         this.adModal=0;
        }
      },
      activarDesactivarCerrar(){
          this.adModal=0;
      }
       
   },
  }
</script>
