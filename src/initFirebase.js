import firebase from 'firebase'
import firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import store from './store'

firebase.initializeApp({
  apiKey: 'AIzaSyAtk4hWAZ1KkrYzf-YqVDdhYxlVM0FJUjw',
  authDomain: 'king-of-football.firebaseapp.com',
  databaseURL: 'https://king-of-football.firebaseio.com',
  projectId: 'king-of-football',
  storageBucket: 'king-of-football.appspot.com',
  messagingSenderId: '409054935993',
})

if (__DEV__) {
  window.firebase = firebase
}

export const ui = new firebaseui.auth.AuthUI(firebase.auth())

/**
 * Sync store.state.user with firebase.auth().currentUser
 *
 * This callback is called when firebase.auth() detects user changes,
 * so just update the vuex store with the new user object.
 */
firebase.auth().onAuthStateChanged(user => {
  store.commit('UPDATE_USER', user)
})
