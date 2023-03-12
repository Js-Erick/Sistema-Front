import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Categoria from '../components/Categoria.vue'
import Articulo from '../components/Articulo.vue'
import Rol from '../components/Rol.vue'
import Usuario from '../components/Usuario.vue'
import Cliente from '../components/Cliente.vue'
import Proveedor from '../components/Proveedor.vue'
import Login from '../components/Login.vue'
import Ingreso from '../components/Ingreso.vue'
import Venta from '../components/Venta.vue'
import ConsultaVenta from '../components/ConsultaVenta.vue'
import ConsultaCompra from '../components/ConsultaCompra.vue' 
import store from '../store/index'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta :{
      administrador :true,
      bodeguero: true,
      vendedor: true,
      superusuario: true
    }
  },
  {
    path: '/categorias',
    name: 'categorias',
    component: Categoria,
    meta :{
      administrador :true,
      bodeguero: true,
      superusuario: true
    }
  },
  {
    path: '/articulos',
    name: 'articulos',
    component: Articulo,
    meta :{
      administrador :true,
      bodeguero: true,
      superusuario: true
    }
  },
  {
    path: '/ingresos',
    name: 'ingresos',
    component: Ingreso,
    meta :{
      administrador :true,
      bodeguero: true,
      superusuario: true
    }
  },
  {
    path: '/roles',
    name: 'roles',
    component: Rol,
    meta :{
      administrador :true,
      superusuario: true
    }
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: Usuario,
    meta :{
      administrador :true,
      superusuario: true
    }
  },
  {
    path: '/clientes',
    name: 'clientes',
    component:Cliente,
    meta :{
      administrador :true,
      vendedor: true,
      superusuario: true
    }
  },
  {
    path: '/ventas',
    name: 'ventas',
    component:Venta,
    meta :{
      administrador :true,
      vendedor: true,
      superusuario: true
    }
  },
  {
    path: '/consultaventas',
    name: 'consultaventas',
    component:ConsultaVenta,
    meta :{
      administrador :true,
      superusuario: true
    }
  },
  {
    path: '/consultacompras',
    name: 'consultacompras',
    component:ConsultaCompra,
    meta :{
      administrador :true,
      superusuario: true
    }
  },
  {
    path: '/proveedores',
    name: 'proveedores',
    component:Proveedor,
    meta :{
      administrador :true,
      bodeguero: true,
      superusuario: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta : {
      libre: true
    }
  }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.libre)){
    next()
  } else if (store.state.usuario && store.state.usuario.rol== 'Administrador'){
    if (to.matched.some(record => record.meta.administrador || record.meta.superusuario)){
      next()
    }
  }else if (store.state.usuario && store.state.usuario.rol== 'Bodeguero'){
    if (to.matched.some(record => record.meta.bodeguero || record.meta.superusuario)){
      next()
    }
  }else if (store.state.usuario && store.state.usuario.rol== 'Vendedor'){
    if (to.matched.some(record => record.meta.vendedor || record.meta.superusuario)){
      next()
    }
  }else if (store.state.usuario && store.state.usuario.rol== 'SuperUsuario'){
    if (to.matched.some(record => record.meta.administrador || record.meta.bodeguero || record.meta.vendedor || record.meta.superusuario)){
      next()
    }
  } else{
    next({
      name: '',
    })
  }
})


export default router
