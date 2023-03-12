<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat>
        <v-toolbar-title>Categorias</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line
          hide-details></v-text-field>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="info" dark class="mb-2" v-bind="attrs" v-on="on">
              Nueva Categoria
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container >
                <v-row>
                  <v-col  cols="12" sm="12" md="12">
                    <v-text-field  v-model="nombre" label="Nombre"></v-text-field>
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
              <v-btn color="info" text @click="close">
                Cancelar
              </v-btn>
              <v-btn color="info" text @click="guardar">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="adModal" max-width="500px">
          <v-card>
            <v-card-title class="text-h5" v-if="adAccion == 1">¿Activar Item?</v-card-title>
            <v-card-title class="text-h5" v-if="adAccion == 2">¿Desactivar Item?</v-card-title>
            <v-card-text>
              Estás a punto de
              <span v-if="(adAccion == 1)">Activar</span>
              <span v-if="(adAccion == 2)">Desactivar</span>
              el ítem {{ adNombre }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="activarDesactivarCerrar">Cancelar</v-btn>
              <v-btn v-if="(adAccion == 1)" color="red darken-1" text @click="activar">Activar</v-btn>
              <v-btn v-if="(adAccion == 2)" color="red darken-1" text @click="desactivar">Desactivar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-data-table :headers="headers" :items="categorias" :search="search" class="elevation-1">
        <template v-slot:top>
        </template>
        <template v-slot:item.condicion="{ item }">
          <template v-if="item.condicion">
            <span class="blue-grey--text">Activo</span>
          </template>
          <template v-else>
            <span class="red--text">Inactivo</span>
          </template>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small color="green" class="mr-2" @click="editItem(item)">
            edit
          </v-icon>
          <v-icon v-if="esSuperUsuario" small color="red" class="mr-2" @click="borrarRegistro(item)" >
            delete
          </v-icon>
          <template v-if="item.condicion">
            <v-icon small color="red" class="mr-2" @click="activarDesactivarMostrar(2, item)">
              block
            </v-icon>
          </template>
          <template v-else>
            <v-icon small color="blue" class="mr-2" @click="activarDesactivarMostrar(1, item)">
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
      <v-dialog  v-model="dialogDelete" max-width="400px" >
        <v-card>
          <v-card-title>
            Estas seguro de eliminar el registro??
          </v-card-title>
          <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="info" text @click="closeDelete">
                Cancelar
              </v-btn>
              <v-btn color="info" text @click="eliminar">
                Aceptar
              </v-btn>
            </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from 'axios';
export default {
  data: () => ({
    categorias: [],
    dialog: false,
    adModal: 0,
    adAccion: 0,
    adNombre: '',
    adId: '',
    dialogDelete: 0,
    headers: [
      { text: 'Nombre', value: 'nombre' },
      { text: 'Descripcion', value: 'descripcion', sortable: false },
      { text: 'Estado', value: 'condicion', sortable: false },
      { text: 'Opciones', value: 'actions', sortable: false },
    ],
    search: '',
    editedIndex: -1,

    id: 0,
    nombre: null,
    descripcion: null,
    condicion: true,
    valida: 0,
    validaMensaje: [],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nueva Categoria' : 'Editar Categoria'
    },

    esSuperUsuario(){
      return this.$store.state.usuario && this.$store.state.usuario.rol =='SuperUsuario';
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  created() {
    this.listar();
  },

  methods: {
    listar() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.get('api/Categorias/Listar', configuration).then( response =>{
        //console.log(response);

        me.categorias = response.data;
      }).catch( error => {
        console.log(error);
      });
    },
    
    editItem(item) {
      console.log(item.idcategoria);
      this.id = item.idcategoria;
      this.nombre = item.nombre;
      this.descripcion = item.descripcion;
      this.editedIndex = 1;
      this.dialog = true

    },

    close() {
      this.dialog = false
      this.limpiar();
    },

    closeDelete() {
      this.dialogDelete = 0
    },

    limpiar() {
      this.id = '';
      this.nombre = '';
      this.descripcion = '';
    },

    guardar() {
      if (this.validar()) {
        return;
      }
      if (this.editedIndex > -1) {
        //Editar
        let me = this;
        let header = { "Authorization": "Bearer " + this.$store.state.token };
        let configuration = { headers: header };
        //console.log(this.id)
        axios.put('api/Categorias/Actualizar', {
          'idcategoria': me.id,
          'nombre': me.nombre,
          'descripcion': me.descripcion,
          'condicion': me.condicion,

        }, configuration).then(res =>  {
          console.log(res)
          me.close();
          me.listar();
          me.limpiar();
        }).catch( error => {
          console.log(error);
        });
      } else {
        //Guardar
        //console.log(this.nombre)
        //console.log(this.descripcion)
        let me = this;
        let header = { "Authorization": "Bearer " + this.$store.state.token };
        let configuration = { headers: header };
        axios.post('api/Categorias/Crear', {
          'nombre': me.nombre,
          'descripcion': me.descripcion,
          'condicion': me.condicion,

        }, configuration).then(res =>  {
          //console.log(res)
          me.close();
          me.listar();
          me.limpiar();
        }).catch(error =>  {
          console.log(error);
        });
      }
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (this.nombre.length < 3 || this.nombre.length > 50) {
        this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos que 50")
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }
      return this.valida;
    },
    activar() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.put('api/Categorias/Activar/' + this.adId, {}, configuration).then(response => {
        me.adModal = 0;
        me.adAccion = 0;
        me.adNombre = "";
        me.adId = "";
        me.listar();
      }).catch(error =>  {
        console.log(error);
      });
    },

    desactivar() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.put('api/Categorias/Desactivar/' + this.adId, {}, configuration).then(response => { 
        me.adModal = 0;
        me.adAccion = 0;
        me.adNombre = "";
        me.adId = "";
        me.listar();
      }).catch(error =>  {
        console.log(error);
      });
    },

    eliminar() {
      let me = this;
      var config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: 'api/Categorias/Eliminar/' + this.id,
        headers: {
          'Authorization': 'Bearer ' + this.$store.state.token
        }
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          me.adId = "";
          me.dialogDelete = 0;
          me.listar();
        })

        .catch(function (error) {
          console.log(error);
        });
    },
    
    activarDesactivarMostrar(accion, item) {
      this.adModal = 1;
      this.adNombre = item.nombre;
      this.adId = item.idcategoria;
      if (accion == 1) {

        this.adAccion = 1;
      }
      else if (accion == 2) {

        this.adAccion = 2;
      }
      else {
        this.adModal = 0;
      }
    },
    activarDesactivarCerrar() {
      this.adModal = 0;
    },

    borrarRegistro(item){
      this.id = item.idarticulo;
      this.dialogDelete=1;
    },

    closeDelete() {
      this.dialogDelete = 0
    },

    borrarRegistro(item){
      console.log(item.idcategoria)
      this.id = item.idcategoria;
      this.dialogDelete=1;
    },

  },
}
</script>
