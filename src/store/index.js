import Vue from 'vue'
import Vuex from 'vuex'
import { firebaseMutations, firebaseAction } from 'vuexfire'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {
      uid: '',
      displayName: 'Anon',
      isLoggedIn: false,
      photoURL: '',
    },
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
      console.log('vuex store UPDATE_USER', state.user, user)
      // state.user = user
      Object.keys(user || {}).forEach(key => {
        Vue.set(state.user, key, user[key])
      })
      Vue.set(state.user, 'displayName', (user || {}).displayName || 'Anon')
      Vue.set(state.user, 'isLoggedIn', !!user)
      Vue.set(state.user, 'photoURL', (user || {}).photoURL)
    },
    ...firebaseMutations,
  },
  getters: {
  },
})

export default store
