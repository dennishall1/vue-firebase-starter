import Vue from 'vue'
import Vuex from 'vuex'
import { firebaseMutations } from 'vuexfire'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // Will be bound as an object
    user: null,
  },
  actions: {
  },
  mutations: {
    UPDATE_USER (state, user) {
      state.user = user
    },
    ...firebaseMutations,
  },
  getters: {
  },
})

export default store
