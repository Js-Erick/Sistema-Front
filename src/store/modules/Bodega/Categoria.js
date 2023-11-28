import axios from 'axios';

export default {
    namespaced: true,

    state: {
        lista_categorias: []
      },

      mutations:{
        SET_CATEGORIAS(state, lista_categorias) {
            state.lista_categorias = lista_categorias;
          },
      },

      actions:{
        async listarCategorias({ commit, rootState }) {
            try {
              const header = { "Authorization": "Bearer " + rootState.token };
              const configuration = { headers: header };
              const response = await axios.get('api/Categorias/Listar', configuration);
              commit('SET_CATEGORIAS', response.data);
            } catch (error) {
              console.error(error);
            }
          },
      },

      getters:{
        lista_categorias(state){
            return state.lista_categorias;
        }
      }

}