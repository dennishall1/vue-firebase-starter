import firebase from 'firebase'

export default function setLeagueRef () {
  // console.log(this.week, arguments)
  this.$store.dispatch('setLeagueRef', firebase.database().ref(
    '/leagues/' + this.leagueId
  ))
}
