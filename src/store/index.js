import Vue from 'vue'
import Vuex from 'vuex'
import decode from 'jwt-decode'
import router from '../router/index'
import categoriasStore from "@/store/modules/Bodega/Categoria";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null,
    usuario: null
  },
  getters: {
  },
  mutations: {
    setToken(state,token){
      state.token=token
    },
    setUsuario (state,usuario){
      state.usuario=usuario
    }
  },
  actions: {
    guardarToken({commit},token){
      commit("setToken", token)
      commit("setUsuario", decode(token))
      localStorage.setItem("token", token)
    },
    autoLogin({commit}){
      let token = localStorage.getItem("token")
      if (token){
        commit("setToken", token)
        commit("setUsuario", decode(token))
      }
      router.push({path: '/login'})
    },
    salir({commit}){
      commit("setToken", null)
      commit("setUsuario", null)
      localStorage.removeItem("token")
      router.push({path: '/login'})
    }
  },
  modules: {
    categoriasStore
  }
})
