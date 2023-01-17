import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
      options: {
        customProperties: false,
      },
    themes: {
      light: {
        primary: '#6D4C41',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#6D4C41',
        success: '#4CAF50',
        warning: '#FFC107',
        azul:'#007BFF'
      },
    },
  },
  icons: {
    iconfont: 'md',
  },
});
