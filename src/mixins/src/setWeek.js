import firebase from 'firebase'

export default function setWeek (week) {
  // console.log(this.week, arguments)
  this.$store.dispatch('setGamesRef', firebase.database().ref(
    '/schedules/season/' + this.season +
    '/' + this.seasonType +
    '/week/' + (week || this.week)
  ))
  if (week || week === 0) {
    this.week = '' + week
  }
  // location.hash = week || this.week || ''
  // sessionStorage.week = week || this.week || ''
  this.setPicksRef()
}
