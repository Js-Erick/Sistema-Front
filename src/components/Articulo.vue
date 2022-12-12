<template>
    <v-layout align-start>
        <v-flex>
          <v-toolbar flat>
            <v-toolbar-title>Articulos</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line hide-details></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                        Nuevo Articulo
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row>
                               <v-col cols="6" sm="6" md="6">
                                    <v-text-field v-model="codigo" label="Código"></v-text-field>
                                </v-col>
                                <v-col cols="6" sm="6" md="6">
                                    <v-select v-model="idcategoria" :items="categorias" label="Categoría"></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="12">
                                    <v-text-field v-model="nombre" label="Nombre"></v-text-field>
                                </v-col>
                                <v-col cols="6" sm="6" md="6">
                                    <v-text-field type="number" v-model="stock" label="Stock"></v-text-field>
                                </v-col>
                                <v-col cols="6" sm="6" md="6">
                                    <v-text-field type="number" v-model="precioVenta" label="Precio"></v-text-field>
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
              <v-data-table :headers="headers" :items="articulos" :search="search"  class="elevation-1">
                  <template v-slot:top>
                  </template>
                  <template v-slot:item.actions="{ item }">
                          <v-icon small class="mr-2" @click="editItem(item)">
                              edit
                          </v-icon>
                          <template v-if="item.condicion">
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
        </v-flex> 
    </v-layout>      
</template>
<script>
  import axios from 'axios';
  export default {
    data: () => ({
      articulos:[],
      dialog: false,
      adModal:0,
      adAccion:0,
      adNombre:'',
      adId:'',
      dialogDelete: false,
      headers: [
        { text: 'Código', value: 'codigo',sortable: false },
        { text: 'Nombre', value: 'nombre' },
        { text: 'Categoría', value: 'idcategoriaNavigation.nombre' },
        { text: 'Stock', value: 'stock',sortable:false},
        { text: 'Precio', value: 'precioVenta' },
        { text: 'Descripcion', value: 'descripcion',sortable: false },
        { text: 'Estado', value: 'condicion',sortable: false },
        { text: 'Opciones', value: 'actions', sortable: false },
      ],
      search:'',
      editedIndex: -1,
      
      id:0,
      nombre:null,
      descripcion:null,
      condicion:true,
      valida:0,
      validaMensaje:[],
      idcategoria:0,
      categorias:[],
      codigo:null,
      stock:0,
      precioVenta:0,

    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Articulo' : 'Editar Articulo'
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
            axios.get('api/Articulos/Listar').then(function (response) {
              //console.log(response);
              me.articulos = response.data;
            }).catch(function (error) {
              console.log(error);
            });
            },
        select() {
          let me = this;
          let categoriasArray = []
          axios.get('api/Categorias/Select').then(function (response) {
            //console.log(response);
            categoriasArray = response.data,
              categoriasArray.map(function (x) {
                me.categorias.push({ text: x.nombre, value: x.idcategoria })
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
        this.id = item.idarticulo;
        this.idcategoria=item.idcategoria;
        this.codigo=item.codigo;
        this.stock=item.stock;
        this.precioVenta=item.precioVenta;
        this.nombre = item.nombre;
        this.descripcion = item.descripcion;
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
      this.descripcion='';
      this.editedIndex = -1;
      this.idcategoria= '';
      this.codigo='';
      this.stock='';
      this.precioVenta='';
      },

      guardar () {
         if(this.validar()){
            return;
         }
        if (this.editedIndex > -1) {
          //Editar
          let me=this;
          //console.log(this.id)
          axios.put('api/Articulos/Actualizar',{
            'idarticulo': me.id,
            'idcategoria': me.idcategoria,
            'codigo':me.codigo,
            'nombre': me.nombre,
            'stock': me.stock,
            'descripcion': me.descripcion,
            'precioVenta' : me.precioVenta
             
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
          axios.post('api/Articulos/Crear',{
            'idcategoria': me.idcategoria,
            'codigo':me.codigo,
            'nombre': me.nombre,
            'stock': me.stock,
            'descripcion': me.descripcion,
            'precioVenta' : me.precioVenta,
            'condicion':me.condicion,
            
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
            this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos que 50.")
        }
        if(!this.idcategoria){
            this.validaMensaje.push("Selecione una categoría.")
        }
        if(!this.stock || this.stock==0 ){
            this.validaMensaje.push("Ingresar stock del articulo.")
        }
        if(!this.precioVenta || this.precioVenta==0 ){
            this.validaMensaje.push("Ingresar precio del articulo.")
        }
        if (this.validaMensaje.length){
          this.valida=1;
        }
        return this.valida;
      },
      activar(){
          let me=this;
          axios.put('api/Articulos/Activar/'+this.adId,{}).then(function(response){
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
          axios.put('api/Articulos/Desactivar/'+this.adId,{}).then(function(response){
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
        this.adId=item.idarticulo;
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
