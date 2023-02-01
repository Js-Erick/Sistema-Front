<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat>
        <v-toolbar-title>Usuarios</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line
          hide-details></v-text-field>
        <v-spacer></v-spacer>

        <!-- NUEVO USUARIO-->

        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              Nuevo Usuario
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
                    <v-text-field v-model="numDocumento" label="Numero Documento"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="direccion" label="Direccion"></v-text-field>
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
              <v-btn color="info" text @click="close">
                Cancelar
              </v-btn>
              <v-btn color="info" text @click="guardar">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!--ACTIVAR / DESACTIVAR REGISTRO-->

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

      <!-- DATA TABLE -->

      <v-data-table :headers="headers" :items="usuarios" :search="search" class="elevation-1">
        <template v-slot:top>
        </template>
        <template v-slot:item.condicion="{ item }">
          <template v-if="item.condicion">
            <span class="blue--text">Activo</span>
          </template>
          <template v-else>
            <span class="red--text">Inactivo</span>
          </template>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small color="green" class="mr-2" @click="editItem(item)">
            edit
          </v-icon>
          <template v-if="item.condicion">
            <v-icon small color="red" @click="activarDesactivarMostrar(2, item)">
              block
            </v-icon>
          </template>
          <template v-else>
            <v-icon small color="blue" @click="activarDesactivarMostrar(1, item)">
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
    usuarios: [],
    dialog: false,
    adModal: 0,
    adAccion: 0,
    adNombre: '',
    adId: '',
    dialogDelete: false,
    valida: 0,
    validaMensaje: [],
    search: '',
    editedIndex: -1,
    headers: [
      { text: 'Nombre', value: 'nombre' },
      { text: 'Rol', value: 'idrolNavigation.nombre' },
      { text: 'Tipo Documento', value: 'tipoDocumento' },
      { text: 'Numero Documento', value: 'numDocumento', sortable: false },
      { text: 'Dirección', value: 'direccion', sortable: false },
      { text: 'Teléfono', value: 'telefono', sortable: false },
      { text: 'Email', value: 'email', sortable: false },
      { text: 'Estado', value: 'condicion', sortable: false },
      { text: 'Opciones', value: 'actions', sortable: false },
    ],

    id: 0,
    nombre: null,
    descripcion: null,
    condicion: true,
    idrol: 0,
    roles: [],
    documentos: ['Dni', 'Cedula', 'Pasaporte'],
    tipoDocumento: null,
    numDocumento: null,
    direccion: null,
    telefono: null,
    email: null,
    password: null,
    act_Password: false,
    passwordAnt: null
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nuevo Usuario' : 'Editar Usuario'
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
    this.select();
  },

  methods: {

    listar() {
      let me = this;
      let header={"Authorization" : "Bearer " + this.$store.state.token};
      let configuration= {headers : header};
      axios.get('api/Usuarios/Listar', configuration).then(response => {
        console.log(response);
        me.usuarios = response.data;
      }).catch(error => {
        console.log(error);
      });
    },

    select() {
      let me = this;
      let rolesArray = []
      let header={"Authorization" : "Bearer " + this.$store.state.token};
      let configuration= {headers : header};
      axios.get('api/Roles/Select', configuration).then(response => {
        //console.log(response);
        rolesArray = response.data,
          rolesArray.map(x => {
            me.roles.push({ text: x.nombre, value: x.idrol })
          });
      }).catch(error => {
        console.log(error);
      });
    },



    editItem(item) {
      //console.log(this.id); 
      this.id = item.idusuario;
      this.idrol = item.idrol;
      this.nombre = item.nombre;
      this.tipoDocumento = item.tipoDocumento;
      this.numDocumento = item.numDocumento;
      this.direccion = item.direccion;
      this.telefono = item.telefono;
      this.email = item.email;
      this.password = item.passwordHash;
      this.passwordAnt = item.passwordHash;
      this.editedIndex = 1;
      this.dialog = true

    },

    close() {
      this.dialog = false
      this.limpiar();
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    limpiar() {
      this.id = '';
      this.nombre = '';
      this.tipoDocumento = '';
      this.numDocumento = '';
      this.direccion = '';
      this.telefono = '';
      this.email = '';
      this.password = '';
      this.passwordAnt = '';
      this.act_Password = false
      this.editedIndex = -1;
    },

    guardar() {
      if (this.validar()) {
        return;
      }
      if (this.editedIndex > -1) {
        //Editar
        let me = this;
        let header={"Authorization" : "Bearer " + this.$store.state.token};
        let configuration= {headers : header};
        if (me.password != me.passwordAnt) {
          me.act_Password = true
        }
        console.log(this.id)
        axios.put('api/Usuarios/Actualizar', {
          'idusuario': me.id,
          'idrol': me.idrol,
          'nombre': me.nombre,
          'tipoDocumento': me.tipoDocumento,
          'numDocumento': me.numDocumento,
          'direccion': me.direccion,
          'telefono': me.telefono,
          'email': me.email,
          'password': me.password,
          'act_password': me.act_Password

        }, configuration).then(res => {
          //console.log(res)
          me.close();
          me.listar();
          me.limpiar();
        }).catch(error => {
          console.log(error);
        });
      } else {
        //Guardar
        //console.log(this.nombre)
        //console.log(this.descripcion)
        let me = this;
        let header={"Authorization" : "Bearer " + this.$store.state.token};
        let configuration= {headers : header};
        axios.post('api/Usuarios/Crear', {
          'idrol': me.idrol,
          'nombre': me.nombre,
          'tipoDocumento': me.tipoDocumento,
          'numDocumento': me.numDocumento,
          'direccion': me.direccion,
          'telefono': me.telefono,
          'email': me.email,
          'password': me.password

        }, configuration).then(res => {
          //console.log(res)
          me.close();
          me.listar();
          me.limpiar();
        }).catch(error => {
          console.log(error);
        });
      }
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (this.nombre.length < 3 || this.nombre.length > 100) {
        this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos que 100.")
      }
      if (!this.idrol) {
        this.validaMensaje.push("Selecione un rol.")
      }
      if (!this.tipoDocumento) {
        this.validaMensaje.push("Selecione un tipo de documento.")
      }

      if (!this.email) {
        this.validaMensaje.push("Ingresar mail del usuario.")
      }
      if (!this.password) {
        this.validaMensaje.push("Ingresar password del usuario.")
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }
      return this.valida;
    },
    activar() {
      let me = this;
      let header={"Authorization" : "Bearer " + this.$store.state.token};
      let configuration= {headers : header};
      axios.put('api/Usuarios/Activar/' + this.adId, {}, configuration).then(response => {
        me.adModal = 0;
        me.adAccion = 0;
        me.adNombre = "";
        me.adId = "";
        me.listar();
      }).catch(error => {
        console.log(error);
      });
    },
    desactivar() {
      let me = this;
      let header={"Authorization" : "Bearer " + this.$store.state.token};
      let configuration= {headers : header};
      axios.put('api/Usuarios/Desactivar/' + this.adId, {}, configuration).then(response => {
        me.adModal = 0;
        me.adAccion = 0;
        me.adNombre = "";
        me.adId = "";
        me.listar();
      }).catch(error => {
        console.log(error);
      });
    },
    activarDesactivarMostrar(accion, item) {
      this.adModal = 1;
      this.adNombre = item.nombre;
      this.adId = item.idusuario;
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
    }

  },
}
</script>
