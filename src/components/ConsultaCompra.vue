<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat>
        <v-toolbar-title>Consulta Compras</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        Desde:&nbsp;
        <v-text-field type="date" v-if="verNuevo == 0" class="text-xs-center" v-model="fecha_Inicio"></v-text-field>
        Hasta:&nbsp;
        <v-text-field type="date" v-if="verNuevo == 0" class="text-xs-center" v-model="fecha_Fin"></v-text-field>
        <v-btn v-if="verNuevo == 0" @click="listar()" color="primary" dark class="mb-2">
          Buscar
        </v-btn>
      </v-toolbar>
      <v-data-table :headers="headers" :items="ingresos" :search="search" class="elevation-1" v-if="verNuevo == 0">
        <template v-slot:top>
        </template>
        
        <template v-slot:item.estado="{item}">
            <template v-if="item.estado ==='Aceptado'">
              <span class="blue--text">Aceptado</span>
            </template>
            <template v-else>
                <span class="red--text">Inactivo</span>
          </template>
        </template>
    
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="verDetalles(item)">
              tab
          </v-icon>
        </template>
        <template v-slot:item.fechaHora="{ item }">
        {{ formatFecha(item.fechaHora)}} 
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="listar">
            Reset
          </v-btn>
        </template>
      </v-data-table>
      <v-spacer></v-spacer>
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
      { text: 'Articulo', value: 'articulo', sortable: false },
      { text: 'Cantidad', value: 'cantidad', sortable: false },
      { text: 'Precio', value: 'precio', sortable: false },
      { text: 'Subtotal', value: 'subTotal', sortable: false }
    ],
    totalParcial: 0,
    totalImpuesto: 0,
    total: 0,
    verArticulos: 0,
    verDet: 0,
    fecha_Inicio:null,
    fecha_Fin:null,

  }),

  computed: {
    calcularTotal:function(){
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

    formatFecha(f){
      var fecha = new Date(f)
      let day = fecha.getDate();
      let month = fecha.getMonth()+1;
      let year = fecha.getFullYear();

      if (month < 10){
        if (day > 9)
          return day + '-0'+month+'-'+year
        else
          return '0'+day+'-0'+month+'-'+year
      }
      else{
        if(day > 9)
          return day+'-'+month+'-'+year
        else
          return '-0'+day+'-0'+month+'-'+year
      }
    },

    formatFecha2(f){
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

    
    listarDetalles(id) {
      let me = this;
      axios.get('api/Ingresos/ListarDetalles/' + id).then(response =>{
        //console.log(response);
        me.detalles = response.data;
      }).catch(error => {
        console.log(error);
      });
    },

    verDetalles(item) {
      this.limpiar();
      this.tipoComprobante = item.tipoComprobante;
      this.serieComprobante = item.serieComprobante;
      this.numComprobante = item.numComprobante;
      this.idproveedor = item.idproveedor;
      this.impuesto = item.impuesto;
      this.listarDetalles(item.idingreso);
      this.verNuevo = 1;
      this.verDet = 1;
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
      if (!me.fecha_Inicio || !me.fecha_Fin) { url = 'api/Ingresos/Listar'; }
      else {
        url = 'api/Ingresos/ConsultaFechas/' + me.fecha_Inicio+'/'+me.fecha_Fin;
      }
      axios.get(url).then(response => {
        console.log(response);
        me.ingresos = response.data;
      }).catch(error => {
        console.log(error);
      });
    },
    select() {
      let me = this;
      let proveedoresArray = []
      axios.get('api/Personas/SelectProveedores').then(response => {
        //console.log(response);
        proveedoresArray = response.data,
          proveedoresArray.map(x => {
            me.proveedores.push({ text: x.nombre, value: x.idpersona })
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
      this.idproveedor = "";
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
  },
}
</script>
