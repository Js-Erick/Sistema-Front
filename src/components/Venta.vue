<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat>
        <v-toolbar-title>Ventas</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field v-if="verNuevo == 0" class="text-xs-center" v-model="search" append-icon="search" label="Busqueda"
          single-line hide-details></v-text-field>
        <v-spacer></v-spacer>
        <v-btn v-if="verNuevo == 0" @click="mostrarNuevo" color="primary" dark class="mb-2">
          Nuevo
        </v-btn>

        <!--  DIALOG BUSCAR ARTICULO POR NOMBRE   -->

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
                        <template v-slot:item.seleccionar="{ item }">
                          <v-icon small class="mr-2" @click="agregarDetalle(item)">
                            add
                          </v-icon>
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

        <!--  DIALOG ANULAR VENTA   -->

        <v-dialog v-model="adModal" max-width="500px">
          <v-card>
            <v-card-title class="text-h5" v-if="adAccion == 1">¿Activar Item?</v-card-title>
            <v-card-title class="text-h5" v-if="adAccion == 2">¿Anular Venta?</v-card-title>
            <v-card-text>
              Estás a punto de
              <span v-if="(adAccion == 1)">Activar</span>
              <span v-if="(adAccion == 2)">Anular</span>
              el ítem {{ adNombre }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="activarDesactivarCerrar">Cancelar</v-btn>
              <v-btn v-if="(adAccion == 1)" color="red darken-1" text @click="activar">Activar</v-btn>
              <v-btn v-if="(adAccion == 2)" color="red darken-1" text @click="desactivar">Anular</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!--  DIALOG COMPROBANTE DE VENTA   -->

        <v-dialog v-model="comprobanteModal" max width="1000px">
          <v-card>
            <v-card-text>
              <v-btn @click="crearPDF"><v-icon>print</v-icon></v-btn>
              <div id="factura">
                <header>
                  <div id="logo">
                    <img
                      src="data:image/jpeg;base64,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"
                      id="imagen">
                  </div>
                  <div id="datos">
                    <p id="encabezado">
                      <b>Sistema Erick</b><br>Av. Providencia 2585,- Santiago,
                      Chile<br>Telefono:(+56)977000039<br>Email:erfadian009@gmail.com
                    </p>
                  </div>
                  <div id="fact">
                    <p>{{ tipoComprobante }}<br>
                      {{ serieComprobante }}-{{ numComprobante }}<br>
                      {{ fechaHora }}</p>
                  </div>
                </header>
                <br>
                <section>
                  <div>
                    <table id="facliente">
                      <tbody>
                        <tr>
                          <td id="cliente">
                            <strong>Sr(a). {{ cliente }}</strong><br>
                            <strong>Documento:</strong> {{ numDocumento }}<br>
                            <strong>Dirección:</strong> {{ direccion }}<br>
                            <strong>Teléfono:</strong> {{ telefono }}<br>
                            <strong>Email:</strong> {{ email }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <br>
                <section>
                  <div>
                    <table id="facarticulo">
                      <thead>
                        <tr id="fa">
                          <th>CANT</th>
                          <th>DESCRIPCION</th>
                          <th>PRECIO UNIT</th>
                          <th>DESC.</th>
                          <th>PRECIO TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="d in detalles" :key="d.iddetalleVenta">
                          <td style="text-align:center;">{{ d.cantidad }}</td>
                          <td style="text-align:center;">{{ d.nombre }}</td>
                          <td style="text-align:center;">{{ d.precio }}</td>
                          <td style="text-align:center;">{{ d.descuento }}</td>
                          <td style="text-align:center;">{{ d.cantidad * d.precio - d.descuento }}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th style="text-align:right;">SUBTOTAL</th>
                          <th style="text-align:right;">$ {{ totalParcial = (total - totalImpuesto) }}</th>
                        </tr>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th style="text-align:right;">IVA({{ impuesto }}%)</th>
                          <th style="text-align:right;">$ {{ totalImpuesto = ((total * impuesto) / (100 + impuesto)) }}
                          </th>
                        </tr>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th style="text-align:right;">TOTAL</th>
                          <th style="text-align:right;">$ {{ total=(calcularTotal) }}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
                <br>
                <br>
                <footer>
                  <div id="gracias">
                    <p><b>Gracias por su comprar</b></p>
                  </div>
                </footer>
              </div>
              <v-btn @click="ocultarComprobante()" color="info">Cerrar</v-btn>
            </v-card-text>
          </v-card>
        </v-dialog>

      </v-toolbar>

      <!--  DATATABLE VENTAS   -->

      <v-data-table :headers="headers" :items="ventas" :search="search" class="elevation-1" v-if="verNuevo == 0">
        <template v-slot:top>
        </template>
        <template v-slot:item.estado="{ item }">
          <template v-if="item.estado === 'Aceptado'">
            <span class="blue--text">Aceptado</span>
          </template>
          <template v-else>
            <span class="red--text">Inactivo</span>
          </template>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small color="brown" class="mr-2" @click="verDatosDetalles(item)">
            tab
          </v-icon>
          <v-icon small color="black" class="mr-2" @click="mostrarComprobante(item)">
            print
          </v-icon>
          <v-icon v-if="esSuperUsuario" small color="red accent-4" class="mr-2" @click="borrarRegistro(item)">
            delete
          </v-icon>
          <template v-if="item.estado == 'Aceptado'">
            <v-icon small color="orange darken-4" @click="activarDesactivarMostrar(2, item)">
              block
            </v-icon>
          </template>
        </template>
        <template v-slot:item.fechaHora="{ item }">
          {{ formatFecha(item.fechaHora) }}
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="listar">
            Reset
          </v-btn>
        </template>
      </v-data-table>

      <v-spacer></v-spacer>

      <!--  CONTENEDOR NUEVA VENTA   -->

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
          <v-flex xs12 sm8 md8 xl8>
            <v-select v-model="idcliente" :items="clientes" label="Cliente">
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
            <v-btn @click="mostrarArticulos()" small fab dark color="ambar">
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
              <template v-slot:item.cantidad="props">
                <td>
                  <v-text-field type="number" v-model.number="props.item.cantidad">
                  </v-text-field>
                </td>
              </template>
              <template v-slot:item.precio="props">
                <td>
                  <v-text-field readonly single-line v-model.number="props.item.precio"></v-text-field>
                </td>
              </template>
              <template v-slot:item.descuento="props">
                <td>
                  <v-text-field single-line v-model.number="props.item.descuento"></v-text-field>
                </td>
              </template>
              <template v-slot:item.subTotal="{ item }">
                ${{ calcularSubTotal(item.subTotal) }}
              </template>
              <template v-slot:no-data>
                <h3>No hay articulos agregados al detalle </h3>
              </template>
            </v-data-table>
            <v-flex class="text-xs-right">
              <strong>Total Parcial: $</strong>{{ totalParcial = (total - totalImpuesto) }}
            </v-flex>
            <v-flex class="text-xs-right">
              <strong>Total Impuesto: $</strong>{{ totalImpuesto = ((total * impuesto) / (100 + impuesto)) }}
            </v-flex>
            <v-flex class="text-xs-right">
              <strong>Total Neto: $</strong>{{ total = (calcularTotal) }}
            </v-flex>
          </v-flex>
          <v-flex xs12 sm12 md12 xl12>
            <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v"></div>
          </v-flex>
          <v-flex xs12 sm12 md12 xl12>
            <v-btn @click="ocultarNuevo()" color="orange darken-2" text>
              Cancelar
            </v-btn>
            <v-btn v-if="verDet == 0" @click="guardar()" color="success">
              Guardar
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>

      <!--  DIALOG DETALLE DE VENTA   -->

      <v-dialog v-model="verDeta" max-width="600px">
        <v-card>
          <v-card-title class="text-h6">Detalles</v-card-title>
          <v-data-table :headers="headerDetalles" :items="detalles" :search="search" class="elevation-1"></v-data-table>
          <v-card-actions>
            <v-btn color="info" text @click="closeDeta">
              Cerrar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--  DIALOG ELIMINAR VENTA   -->

      <v-dialog v-model="dialogDelete" max-width="400px">
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
import html2canvas from 'html2canvas';
export default {
  data: () => ({
    ventas: [],
    dialog: false,
    adModal: 0,
    adAccion: 0,
    adNombre: '',
    adId: '',
    dialogDelete: 0,
    valida: 0,
    validaMensaje: [],
    search: '',
    verNuevo: 0,
    errorArticulo: null,
    comprobanteModal: 0,

    headers: [
      { text: 'Usuario', value: 'idusuarioNavigation.nombre' },
      { text: 'Cliente ', value: 'idclienteNavigation.nombre' },
      { text: 'Tipo Comprobante', value: 'tipoComprobante' },
      { text: 'Serie Comprobante', value: 'serieComprobante', sortable: false },
      { text: '# Comprobante', value: 'numComprobante', sortable: false },
      { text: 'Impuesto', value: 'impuesto', sortable: false },
      { text: 'Total', value: 'total', sortable: false },
      { text: 'Fecha', value: 'fechaHora', sortable: false },
      { text: 'Estado', value: 'estado', sortable: false },
      { text: 'Opciones', value: 'actions', sortable: false },
    ],

    id: 0,
    condicion: true,
    idcliente: 0,
    clientes: [],
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
      { text: 'Descuento', value: 'descuento', sortable: false },

    ],
    totalParcial: 0,
    totalImpuesto: 0,
    total: 0,
    verArticulos: 0,
    verDet: 0,
    verDeta: 0,
    headerDetalles: [
      { text: 'Articulo', value: 'idarticuloNavigation.nombre', sortable: false },
      { text: 'Cantidad', value: 'cantidad', sortable: false },
      { text: 'Precio', value: 'precio', sortable: false },
      { text: 'Descuento', value: 'descuento', sortable: false },
    ],
    cliente: null,
    fechaHora: null,
    numDocumento: null,
    direccion: null,
    telefono: null,
    email: null,
    nombre: null,

  }),

  computed: {
    calcularTotal: function () {
      var resultado = 0;
      for (var i = 0; i < this.detalles.length; i++) {
        resultado = resultado + (this.detalles[i].precio * this.detalles[i].cantidad - this.detalles[i].descuento);
      }
      return resultado;
    },

    esSuperUsuario() {
      return this.$store.state.usuario && this.$store.state.usuario.rol == 'SuperUsuario';
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

    crearPDF() {
      var quotes = document.getElementById('factura');
      html2canvas(quotes).then(canvas => {
        var imgData = canvas.toDataURL('image/png')
        var imgWidth = 210;
        var pageHeight = 295;
        var imgHeight = canvas.height * imgWidth / canvas.width;
        var heightLeft = imgHeight;
        var doc = new jsPDF('p', 'mm', 'a4');
        var position = 0;
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        doc.save("ComprobanteVenta.pdf")
      })
    },

    mostrarComprobante(item) {
      this.limpiar();
      this.tipoComprobante = item.tipoComprobante;
      this.serieComprobante = item.serieComprobante;
      this.numComprobante = item.numComprobante;
      this.cliente = item.idclienteNavigation.nombre;
      this.numDocumento = item.idclienteNavigation.numDocumento;
      this.direccion = item.idclienteNavigation.direccion;
      this.telefono = item.idclienteNavigation.telefono;
      this.email = item.idclienteNavigation.email;
      this.fechaHora = item.fechaHora;
      this.impuesto = item.impuesto;
      this.listarDetalles(item.idventa);
      this.comprobanteModal = 1;
    },

    ocultarComprobante() {
      this.comprobanteModal = 0;
      this.limpiar();
    },

    calcularSubTotal: function () {
      var resultado = 0;
      this.detalles.forEach(e => { resultado += e.precio * e.cantidad - e.descuento; });
      console.log(resultado);
      return resultado
    },

    formatFecha(f) {
      var fecha = new Date(f)
      let day = fecha.getDate();
      let month = fecha.getMonth() + 1;
      let year = fecha.getFullYear();

      if (month < 10) {
        if (day > 9)
          return day + '-0' + month + '-' + year
        else
          return '0' + day + '-0' + month + '-' + year
      }
      else {
        if (day > 9)
          return day + '-' + month + '-' + year
        else
          return '-0' + day + '-0' + month + '-' + year
      }
    },


    formatFecha2(f) {
      var fecha = new Date(f).toISOString().substring(0, 10);
      return fecha;
    },

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
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.get('api/Articulos/BuscarCodigoVenta/' + this.codigo, configuration).then(response => {
        //console.log(response);
        me.agregarDetalle(response.data);
      }).catch(error => {
        console.log(error);
        me.errorArticulo = 'No existe el artículo';
      });
    },

    listarArticulo() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.get('api/Articulos/ListarVenta/' + me.texto, configuration).then(response => {
        //console.log(response);
        me.articulos = response.data;
      }).catch(error => {
        console.log(error);
      });
    },

    listarDetalles(id) {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.get('api/Ventas/ListarDetalles/' + id, configuration).then(response => {
        console.log(response.data);
        me.detalles = response.data;
      }).catch(error => {
        console.log(error);
      });
    },

    /*verDetalles(item) {
      this.limpiar();
      this.tipoComprobante = item.tipoComprobante;
      this.serieComprobante = item.serieComprobante;
      this.numComprobante = item.numComprobante;
      this.idproveedor = item.idproveedor;
      this.impuesto = item.impuesto;
      this.listarDetalles(item.idingreso);
      this.verNuevo = 1;
      this.verDet = 1;
    },*/

    verDatosDetalles(item) {
      this.limpiar();
      this.tipoComprobante = item.tipoComprobante;
      this.serieComprobante = item.serieComprobante;
      this.numComprobante = item.numComprobante;
      this.idcliente = item.idcliente;
      this.impuesto = item.impuesto;
      this.listarDetalles(item.idventa);
      this.verDeta = 1;
    },

    closeDeta() {
      this.limpiar();
      this.verDeta = 0;
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
          { idarticulo: data['idarticulo'], articulo: data['nombre'], cantidad: 1, descuento: 0, precio: data['precioVenta'] });
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
      let url = '';
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      if (!me.search) { url = 'api/Ventas/Listar'; }
      else {
        url = 'api/Ventas/ListarFiltro/' + me.search;
      }
      axios.get(url, configuration).then(response => {
        //console.log(response);
        me.ventas = response.data;
      }).catch(error => {
        console.log(error);
      });
    },

    select() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      let clientesArray = []
      axios.get('api/Personas/SelectClientes', configuration).then(response => {
        //console.log(response);
        clientesArray = response.data,
          clientesArray.map(x => {
            me.clientes.push({ text: x.nombre, value: x.idpersona })
          });
      }).catch(error => {
        console.log(error);
      });
    },


    close() {
      this.dialog = false
      this.limpiar();
    },

    limpiar() {
      this.id = "";
      this.idcliente = "";
      this.tipoComprobante = "";
      this.serieComprobante = "";
      this.numComprobante = "";
      this.impuesto = "18";
      this.codigo = "";
      this.detalles = [];
      this.total = 0;
      this.totalImpuesto = 0;
      this.totalParcial = 0;
      this.verDet = 0;
    },

    guardar() {
      if (this.validar()) {
        return;
      }
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.post('api/Ventas/Crear', {
        'idcliente': me.idcliente,
        'idusuario': me.$store.state.usuario.idusuario,
        'tipoComprobante': me.tipoComprobante,
        'serieComprobante': me.serieComprobante,
        'numComprobante': me.numComprobante,
        'impuesto': me.impuesto,
        'total': me.total,
        'detalles': me.detalles
      }, configuration).then(res => {
        console.log(res)
        me.ocultarNuevo();
        me.listar();
        me.limpiar();
      }).catch(error => {
        console.log(error);
      });
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (!this.idcliente) {
        this.validaMensaje.push("Seleccione un cliente.");
      }
      if (!this.tipoComprobante) {
        this.validaMensaje.push("Seleccione un tipo de comprobante.");
      }
      if (!this.numComprobante) {
        this.validaMensaje.push("Ingrese el número del comprobante.");
      }
      if (!this.impuesto || this.impuesto < 0) {
        this.validaMensaje.push("Ingrese un impuesto válido.");
      }
      if (this.detalles.length <= 0) {
        this.validaMensaje.push("Ingrese al menos un artículo al detalle.");
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }
      return this.valida;
    },

    eliminar() {
      let me = this;
      var config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: 'api/Ventas/Eliminar/' + this.id,
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

    desactivar() {
      let me = this;
      let header = { "Authorization": "Bearer " + this.$store.state.token };
      let configuration = { headers: header };
      axios.put('api/Ventas/Anular/' + this.adId, {}, configuration).then(() => {
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
      this.adNombre = item.numComprobante;
      this.adId = item.idventa;
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

    closeDelete() {
      this.dialogDelete = 0
    },

    borrarRegistro(item) {
      this.id = item.idventa;
      this.dialogDelete = 1;
    },
  },

  /*activar() {
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
    },*/
}
</script>

<style>
#factura {
  padding: 20px;
  font-family: Arial, sans-serif;
  font-size: 16px;
}

#logo {
  float: left;
  margin-left: 2%;
  margin-right: 2%;
}

#imagen {
  width: 100px;
}

#fact {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

#datos {
  float: left;
  margin-top: 0%;
  margin-left: 2%;
  margin-right: 2%;
  /*text-align: justify;*/
}

#encabezado {
  text-align: center;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 16px;
}

section {
  clear: left;
}

#cliente {
  text-align: left;
}

#facliente {
  width: 40%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 15px;
}

#fa {
  background: #6D4C41;
  color: #FFFFFF;
  font-size: 14px;
}

#facarticulo {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  padding: 20px;
  margin-bottom: 15px;
}

#facarticulo thead {
  padding: 20px;
  background: #6D4C41;
  text-align: center;
  border-bottom: 1px solid #FFFFFF;
}

#gracias {
  text-align: center;
}
</style>
