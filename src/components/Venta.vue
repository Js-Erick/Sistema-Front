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
        </v-toolbar>
  
        <v-data-table :headers="headers" :items="ventas" :search="search" class="elevation-1" v-if="verNuevo == 0">
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
            <v-icon small  color="brown" class="mr-2" @click="verDatosDetalles(item)">
              tab
            </v-icon>
            <v-icon v-if="esAdministrador" small color="red" class="mr-2" @click="borrarRegistro(item)" >
              delete
            </v-icon>
            <template v-if="item.estado == 'Aceptado'">
              <v-icon small color="red" @click="activarDesactivarMostrar(2, item)">
                block
              </v-icon>
            </template>
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
                  <v-text-field type="number" v-model.number="props.item.cantidad" >
                  </v-text-field>
                </td>
                </template>
                <template v-slot:item.precio="props">
                <td>
                  <v-text-field
                    readonly
                    single-line
                    v-model.number="props.item.precio"
                  ></v-text-field>
                </td>
              </template>
              <template v-slot:item.descuento="props">
                <td>
                  <v-text-field
                    single-line
                    v-model.number="props.item.descuento"
                  ></v-text-field>
                </td>
              </template>
              <template v-slot:item.subTotal="{item}">
                ${{ calcularSubTotal(item.subTotal)}} 
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
              <v-btn v-if="verDet==0" @click="guardar()" color="success">
                Guardar
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
        <v-dialog v-model="verDeta" max-width="600px">
          <v-card>
            <v-card-title class="text-h6">Detalles</v-card-title>           
            <v-data-table :headers="headerDetalles" :items="detalles" :search="search"  class="elevation-1" ></v-data-table>
            <v-card-actions>
              <v-btn color="info" text @click="closeDeta">
                Cerrar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
  export default {
    data: () => ({
      ventas: [],
      dialog: false,
      adModal: 0,
      adAccion: 0,
      adNombre: '',
      adId: '',
      dialogDelete:0,
      valida: 0,
      validaMensaje: [],
      search: '',
      verNuevo: 0,
      errorArticulo: null,
  
      headers: [
      { text: 'Usuario', value: 'idusuarioNavigation.nombre' },
      { text: 'Cliente ', value: 'idclienteNavigation.nombre' },
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
      verDeta:0,
      headerDetalles:[
        { text: 'Articulo', value: 'idarticuloNavigation.nombre', sortable: false },
        { text: 'Cantidad', value: 'cantidad', sortable: false },
        { text: 'Precio', value: 'precio', sortable: false },
        { text: 'Descuento', value: 'descuento', sortable: false },
      ]
  
    }),
  
    computed: {
      calcularTotal: function () {
        var resultado = 0;
        for (var i = 0; i < this.detalles.length; i++) {
          resultado = resultado + (this.detalles[i].precio * this.detalles[i].cantidad-this.detalles[i].descuento);
        }
        return resultado;
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
  
    created() {
      this.listar();
      this.select();
    },
  
    methods: {

      calcularSubTotal:function () {
                var resultado=0;
                this.detalles.forEach(e => {resultado += e.precio*e.cantidad-e.descuento;});
                console.log(resultado);
                return resultado
            },

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
  
      buscarCodigo() {
        let me = this;
        me.errorArticulo = null;
        
        axios.get('api/Articulos/BuscarCodigoVenta/' + this.codigo,).then(response => {
          //console.log(response);
          me.agregarDetalle(response.data);
        }).catch(error => {
          console.log(error);
          me.errorArticulo = 'No existe el artículo';
        });
      },
      listarArticulo() {
        let me = this;
        axios.get('api/Articulos/ListarVenta/' + me.texto).then(response => {
          console.log(response);
          me.articulos = response.data;
        }).catch(error => {
          console.log(error);
        });
      },
      
      listarDetalles(id) {
        let me = this;
        axios.get('api/Ventas/ListarDetalles/' + id).then(response => {
          console.log(response);
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

      verDatosDetalles(item){
       //this.limpiar();
        this.tipoComprobante = item.tipoComprobante;
        this.serieComprobante = item.serieComprobante;
        this.numComprobante = item.numComprobante;
        this.idproveedor = item.idproveedor;
        this.impuesto = item.impuesto;
        this.listarDetalles(item.idventa);
        this.verDeta = 1;
      },

      closeDeta(){
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
      if (!me.search) { url = 'api/Ventas/Listar'; }
      else {
        url = 'api/Ventas/ListarFiltro/' + me.search;
      }
      axios.get(url).then(response =>{
        console.log(response);
        me.ventas = response.data;
      }).catch(error =>{
        console.log(error);
      });
    },
      select() {
        let me = this;
        let clientesArray = []
        axios.get('api/Personas/SelectClientes').then(response => {
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
        axios.post('api/Ventas/Crear', {
          'idcliente': me.idcliente,
          'idusuario': me.$store.state.usuario.idusuario,
          'tipoComprobante': me.tipoComprobante,
          'serieComprobante': me.serieComprobante,
          'numComprobante': me.numComprobante,
          'impuesto': me.impuesto,
          'total': me.total,
          'detalles': me.detalles
        }).then(res => {
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

      eliminar(){
      let me = this;
      axios.delete('api/Ventas/Eliminar/' + this.id, {}).then(response =>{
      console.log(response)
      me.adId = "";
      me.dialogDelete = 0;
      me.listar();
      }).catch(error =>{
        console.log(error);
      });
    },
    
      
      desactivar(){
        let me=this;
  
        axios.put('api/Ventas/Anular/'+this.adId,{},).then(() => {
            me.adModal=0;
            me.adAccion=0;
            me.adNombre="";
            me.adId="";
            me.listar();                       
        }).catch(error =>{
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
  