<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="white">
        <v-toolbar-title>Articulos</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="createPdf"><v-icon>print</v-icon></v-btn>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Busqueda" single-line
          hide-details></v-text-field>
        <v-spacer></v-spacer>
        <!-- DIALOG CREAR / EDITAR -->
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="info" dark class="mb-2" v-bind="attrs" v-on="on">
              Nuevo artículo
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
              <v-btn color="info" text @click="close">
                Cancelar
              </v-btn>
              <v-btn color="info" text @click="guardar">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- DIALOG ACTIVAR / DESACTIVAR -->
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
      <v-data-table :headers="headers" :items="articulos" :search="search" class="elevation-1">
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
          <v-icon v-if="esAdministrador" small color="red" class="mr-2" @click="borrarRegistro(item)" >
            delete
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
        <!-- DIALOG ELIMINAR REGISTRO -->
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export default {
  data: () => ({
    articulos: [],
    dialog: false,
    adModal: 0,
    adAccion: 0,
    adNombre: '',
    adId: '',
    dialogDelete:0,
    headers: [
      { text: 'Código', value: 'codigo', sortable: false },
      { text: 'Nombre', value: 'nombre' },
      { text: 'Categoría', value: 'idcategoriaNavigation.nombre' },
      { text: 'Stock', value: 'stock', sortable: false },
      { text: 'Precio', value: 'precioVenta' },
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
    idcategoria: 0,
    categorias: [],
    codigo: null,
    stock: 0,
    precioVenta: 0,

  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nuevo Articulo' : 'Editar Articulo'
    },

    esAdministrador(){
      return this.$store.state.usuario && this.$store.state.usuario.rol =='Administrador';
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

  created (){
    this.listar();
    this.select();

  },

  methods: {

    createPdf() {
      var doc = new jsPDF('p', 'pt')
      var rows = [];
      this.articulos.map(x => {
        //console.log(x)
        rows.push({ nombre: x.nombre, codigo: x.codigo, categoria: x.idcategoriaNavigation.nombre, stock: x.stock, precioVenta: x.precioVenta });
      });
      doc.autoTable({
        columns: [
          { header: 'Nombre', dataKey: 'nombre' },
          { header: 'Código', dataKey: 'codigo' },
          { header: 'Categoria', dataKey: 'categoria' },
          { header: 'Stock', dataKey: 'stock' },
          { header: 'Precio Venta', dataKey: 'precioVenta' },
        ],
        body: rows,
        margin: { top: 60 },
        didDrawPage: data => {
          doc.text("Listado de Artículos", 40, 30);
        }
      })
      doc.save('Articulos.pdf');
    },


    listar() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.get('api/Articulos/Listar', configuration).then(response => {
        //console.log(response);
        me.articulos = response.data;
      }).catch(error => {
        console.log(error);
      });
    },
    select() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      let categoriasArray = []
      axios.get('api/Categorias/Select', configuration).then(response => {
        //console.log(response);
        categoriasArray = response.data,
          categoriasArray.map(x => {
            me.categorias.push({ text: x.nombre, value: x.idcategoria })
          });
      }).catch(error => {
        console.log(error);
      });
    },

    editItem(item) {
      console.log(item.idarticulo); 
      this.id = item.idarticulo;
      this.idcategoria = item.idcategoria;
      this.codigo = item.codigo;
      this.stock = item.stock;
      this.precioVenta = item.precioVenta;
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
      this.editedIndex = -1;
      this.idcategoria = '';
      this.codigo = '';
      this.stock = '';
      this.precioVenta = '';
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
        console.log(this.id)
        axios.put('api/Articulos/Actualizar', {
          'idarticulo': me.id,
          'idcategoria': me.idcategoria,
          'codigo': me.codigo,
          'nombre': me.nombre,
          'stock': me.stock,
          'descripcion': me.descripcion,
          'precioVenta': me.precioVenta

        }, configuration).then(res => {
          console.log(res)
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
        let header = { "Authorization": "Bearer " + this.$store.state.token };
        let configuration = { headers: header };
        axios.post('api/Articulos/Crear', {
          'idcategoria': me.idcategoria,
          'codigo': me.codigo,
          'nombre': me.nombre,
          'stock': me.stock,
          'descripcion': me.descripcion,
          'precioVenta': me.precioVenta,
          'condicion': me.condicion,

        }, configuration).then(res => {
          console.log(res)
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
      if (this.nombre.length < 3 || this.nombre.length > 50) {
        this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos que 50.")
      }
      if (!this.idcategoria) {
        this.validaMensaje.push("Selecione una categoría.")
      }
      if (!this.stock || this.stock == 0) {
        this.validaMensaje.push("Ingresar stock del articulo.")
      }
      if (!this.precioVenta || this.precioVenta == 0) {
        this.validaMensaje.push("Ingresar precio del articulo.")
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }
      return this.valida;
    },

    eliminar(){
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.delete('api/Articulos/Eliminar/' + this.id, {}, configuration).then(response =>{
      console.log(response)
      me.adId = "";
      me.dialogDelete = 0;
      me.listar();
      }).catch(error =>{
        console.log(error);
      });
    },

    activar() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.put('api/Articulos/Activar/' + this.adId, {}, configuration).then(response => {
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
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.put('api/Articulos/Desactivar/' + this.adId, {}, configuration).then(response => {
        console.log(me.adId)
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
      this.adId = item.idarticulo;
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
  },

}  

  /*  crearPDF() {
      var columns = [
        { title: "Nombre", dataKey: "nombre" },
        { title: "Código", dataKey: "codigo" },
        { title: "Categoría", dataKey: "categoria" },
        { title: "Stock", dataKey: "stock" },
        { title: "Precio Venta", dataKey: "precioVenta" },
      ];
      var rows = [];
      this.articulos.map(x => {
        //console.log(x)
        rows.push({ nombre: x.nombre, codigo: x.codigo, categoria: x.idcategoriaNavigation.nombre, stock: x.stock, precioVenta: x.precioVenta });
      });

      // Only pt supported (not mm or in)
      var doc = new jsPDF('p', 'pt');
      doc.autoTable(columns, rows, {

        margin: { top: 60 },
        addPageContent: data => {
          //console.log(data)
          doc.text("Listado de Artículos", 40, 30);
        }
      });
      doc.save('Articulos.pdf');
    },*/

</script>



