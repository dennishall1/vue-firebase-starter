import Vue from 'vue'
import Vuex from 'vuex'
import { firebaseMutations, firebaseAction } from 'vuexfire'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    league: {},
    picks: {},
    games: [],
  },
  actions: {
    setLeagueRef: firebaseAction(({ bindFirebaseRef }, ref) => {
      bindFirebaseRef('league', ref, {wait: true})
    }),
    setPicksRef: firebaseAction(({ bindFirebaseRef }, ref) => {
      bindFirebaseRef('picks', ref, {wait: true})
    }),
    setGamesRef: firebaseAction(({ bindFirebaseRef }, ref) => {
      bindFirebaseRef('games', ref, {wait: true})
    }),
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
