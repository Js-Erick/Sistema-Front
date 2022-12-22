<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat>
        <v-toolbar-title>Ingresos</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field v-if="verNuevo == 0" class="text-xs-center" v-model="search" append-icon="search" label="Busqueda"
          single-line hide-details></v-text-field>
        <v-spacer></v-spacer>
        <v-btn v-if="verNuevo == 0" @click="mostrarNuevo" color="primary" dark class="mb-2">
          Nuevo
        </v-btn>
        <v-dialog v-model="verArticulos" max-width="1000px">
          <v-card>
            <v-card-title>
              <span class="headline">Seleccione un artículo</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm12 md12 lg12 xl12>
                    <v-text-field append-icon="search" class="text-xs-center" v-model="texto"
                      label="Ingrese artículo a buscar" @keyup.enter="listarArticulo()">

                    </v-text-field>
                    <template>
                      <v-data-table :headers="cabeceraArticulos" :items="articulos" class="elevation-1">
                        <template v-slot:item.seleccionar="{item}">
                          <v-icon small class="mr-2" @click="agregarDetalle(item)">
                            add
                          </v-icon>
                        </template>
                        <template slot="items" slot-scope="props">
                         
                          <td>{{ item.nombre }}</td>
                          <td>{{ item.idcategoriaNavigation.nombre }}</td>
                          <td>{{ item.descripcion }}</td>
                          <td>{{ item.stock }}</td>
                          <td>{{ item.precioVenta }}</td>
                        </template>
                        <template slot="no-data">
                          <h3>No hay artículos para mostrar.</h3>
                        </template>
                      </v-data-table>
                    </template>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="ocultarArticulos()" color="blue darken" text>
                Cancelar
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

      <v-data-table :headers="headers" :items="ingresos" :search="search" class="elevation-1" v-if="verNuevo == 0">
        <template v-slot:top>
        </template>
        <template v-slot:item.estado="{ item }">
          <template v-if="item.estado">
            <span class="blue--text">Aceptado</span>
          </template>
          <template v-else>
            <span class="red--text">{{ item.estado }}</span>
          </template>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            edit
          </v-icon>
          <template v-if="item.estado == 'Aceptado'">
            <v-icon small @click="activarDesactivarMostrar(2, item)">
              block
            </v-icon>
          </template>
          <template v-else>
            <v-icon small @click="activarDesactivarMostrar(1, item)">
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
      <v-container grid-list-sm class="pa-4 white" v-if="verNuevo">
        <v-layout row wrap>
          <v-flex xs12 sm4 md4 xl4>
            <v-select v-model="tipoComprobante" :items="comprobantes" label="Tipo Comprobante">
            </v-select>
          </v-flex>
          <v-flex xs12 sm4 md4 xl4>
            <v-text-field v-model="serieComprobante" label="Serie Comprobante">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm4 md4 xl4>
            <v-text-field v-model="numComprobante" label="Número Comprobante">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm4 md4 xl4>
            <v-select v-model="idproveedor" :items="proveedores" label="Proveedor">
            </v-select>
          </v-flex>
          <v-flex xs12 sm4 md4 xl4>
            <v-text-field type="number" v-model="impuesto" label="Impuesto">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm8 md8 l8 xl8>
            <v-text-field @keyup.enter="buscarCodigo()" v-model="codigo" label="Código">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 xl2>
            <v-btn @click="mostrarArticulos()" small fab dark color="teal">
              <v-icon dark>list</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs12 sm2 md2 xl2 v-if="errorArticulo">
            <div class="red--text" v-text="errorArticulo">
            </div>
          </v-flex>
          <v-flex xs12 sm12 md12 xl12>
            <v-data-table :headers="cabeceraDetalles" :items="detalles" hide-default-footer class="elevation-1">
              <template v-slot:top>
              </template>
              <template v-slot:item.borrar="{ item }">
                <v-icon small class="mr-2" @click="eliminarDetalle(detalles, item)">
                  delete
                </v-icon>
              </template>
              <template v-slot:no-data>
                <h3>No hay articulos agregados al detalle </h3>
              </template>
            </v-data-table>
            <v-flex class="text-xs-right">
              <strong>Total Parcial:</strong>{{ totalParcial = (total - totalImpuesto) }}
            </v-flex>
            <v-flex class="text-xs-right">
              <strong>Total Impuesto:</strong>{{ totalImpuesto = ((total * impuesto) / (100 + impuesto)) }}
            </v-flex>
            <v-flex class="text-xs-right">
              <strong>Total Neto:</strong>{{ total = (calcularTotal) }}
            </v-flex>
          </v-flex>
          <v-flex xs12 sm12 md12 xl12>
            <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v"></div>
          </v-flex>
          <v-flex xs12 sm12 md12 xl12>
            <v-btn @click="ocultarNuevo()" color="blue darken-1" text>
              Cancelar
            </v-btn>
            <v-btn @click="guardar()" color="success" text>
              Guardar
            </v-btn>
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
    ingresos: [],
    dialog: false,
    adModal: 0,
    adAccion: 0,
    adNombre: '',
    adId: '',
    dialogDelete: false,
    valida: 0,
    validaMensaje: [],
    search: '',
    verNuevo: 0,
    errorArticulo: null,

    headers: [
      { text: 'Usuario', value: 'idusuarioNavigation.nombre' },
      { text: 'Proveedor', value: 'idproveedorNavigation.nombre' },
      { text: 'Tipo Comprobante', value: 'tipoComprobante' },
      { text: 'Serie Comprobante', value: 'serieComprobante', sortable: false },
      { text: 'Numero Comprobante', value: 'numComprobante', sortable: false },
      { text: 'Impuesto', value: 'impuesto', sortable: false },
      { text: 'Total', value: 'total', sortable: false },
      { text: 'Fecha', value: 'fechaHora', sortable: false },
      { text: 'Estado', value: 'estado', sortable: false },
      { text: 'Opciones', value: 'actions', sortable: false },
    ],

    id: 0,
    condicion: true,
    idproveedor: 0,
    proveedores: [],
    comprobantes: ['Factura', 'Boleta', 'Ticket', 'Guia'],
    tipoComprobante: null,
    serieComprobante: null,
    numComprobante: null,
    impuesto: 18,
    codigo: null,
    detalles: [],
    cabeceraArticulos: [
      { text: 'Seleccionar', value: 'seleccionar', sortable: false },
      { text: 'Artículo', value: 'nombre' },
      { text: 'Categoría', value: 'idcategoriaNavigation.nombre' },
      { text: 'Descripción', value: 'descripcion', sortable: false },
      { text: 'Stock', value: 'stock', sortable: false },
      { text: 'Precio Venta', value: 'precioVenta', sortable: false }
    ],
    articulos: [],
    texto: null,
    cabeceraDetalles: [
      { text: 'Borrar', value: 'borrar', sortable: false },
      { text: 'Articulo', value: 'articulo', sortable: false },
      { text: 'Cantidad', value: 'cantidad', sortable: false },
      { text: 'Precio', value: 'precio', sortable: false },
      { text: 'Subtotal', value: 'subTotal', sortable: false }
    ],
    totalParcial: 0,
    totalImpuesto: 0,
    total: 0,
    verArticulos: 0,

  }),

  computed: {
    calcularTotal: function () {
      var resultado = 0;
      for (var i = 0; i < this.detalles.length; i++) {
        resultado = resultado + (this.detalles[i].precio * this.detalles[i].cantidad);
      }
      return resultado;
    }
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

    mostrarNuevo() {
      this.verNuevo = 1;
    },

    ocultarNuevo() {
      this.verNuevo = 0;
      this.limpiar();
    },

    buscarCodigo() {
      let me = this;
      me.errorArticulo = null;
      axios.get('api/Articulos/BuscarCodigoIngreso/' + this.codigo).then(function (response) {
        console.log(response);
        me.agregarDetalle(response.data);
      }).catch(function (error) {
        console.log(error);
        me.errorArticulo = 'No existe el artículo';
      });
    },
    listarArticulo() {
      let me = this;
      axios.get('api/Articulos/ListarIngreso/' + me.texto).then(function (response) {
        console.log(response);
        me.articulos = response.data;
      }).catch(function (error) {
        console.log(error);
      });
    },

    mostrarArticulos() {
      this.verArticulos = 1;
    },
    ocultarArticulos() {
      this.verArticulos = 0;
    },

    agregarDetalle(data = []) {
      this.errorArticulo = null;
      if (this.encuentra(data['idarticulo'])) {
        this.errorArticulo = "El artículo ya ha sido agregado."
      }
      else {
        this.detalles.push(
          { idarticulo: data['idarticulo'], articulo: data['nombre'], cantidad: 1, precio: 1 });
      }
    },

    eliminarDetalle(arr, item) {
      var i = arr.indexOf(item);
      if (i !== -1) {
        arr.splice(i, 1);
      }
    },

    encuentra(id) {
      var sw = 0;
      for (var i = 0; i < this.detalles.length; i++) {
        if (this.detalles[i].idarticulo == id) {
          sw = 1;
        }
      }
      return sw;
    },

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


    close() {
      this.dialog = false
      this.limpiar();
    },

    limpiar() {
      this.id="";
      this.idproveedor="";
      this.tipoComprobante="";
      this.serieComprobante="";
      this.numComprobante="";
      this.impuesto="18";
      this.codigo="";
      this.detalles=[];
      this.total=0;
      this.totalImpuesto=0;
      this.totalParcial=0;
    },

    guardar() {
      if (this.validar()) {
        return;
      }
        let me = this;
        axios.post('api/Ingresos/Crear', {
          'idproveedor':me.idproveedor,
          'idusuario':me.$store.state.usuario.idusuario,
          'tipoComprobante': me.tipoComprobante,
          'serieComprobante': me.serieComprobante,
          'numComprobante':me.numComprobante,
          'impuesto': me.impuesto,
          'total':me.total,
          'detalles':me.detalles

        }).then(function (res) {
          console.log(res)
          me.close();
          me.listar();
          me.limpiar();
        }).catch(function (error) {
          console.log(error);
        });
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (!this.idproveedor){
          this.validaMensaje.push("Seleccione un proveedor.");
      }
      if (!this.tipoComprobante){
          this.validaMensaje.push("Seleccione un tipo de comprobante.");
      }
      if (!this.numComprobante){
          this.validaMensaje.push("Ingrese el número del comprobante.");
      }
      if (!this.impuesto || this.impuesto<0){
          this.validaMensaje.push("Ingrese un impuesto válido.");
      }
      if (this.detalles.length<=0){
          this.validaMensaje.push("Ingrese al menos un artículo al detalle.");
      }
      if (this.validaMensaje.length){
          this.valida=1;
      }
      return this.valida;
    },
    activar() {
      let me = this;
      axios.put('api/Usuarios/Activar/' + this.adId, {}).then(function (response) {
        me.adModal = 0;
        me.adAccion = 0;
        me.adNombre = "";
        me.adId = "";
        me.listar();
      }).catch(function (error) {
        console.log(error);
      });
    },
    desactivar() {
      let me = this;
      axios.put('api/Usuarios/Desactivar/' + this.adId, {}).then(function (response) {
        me.adModal = 0;
        me.adAccion = 0;
        me.adNombre = "";
        me.adId = "";
        me.listar();
      }).catch(function (error) {
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
