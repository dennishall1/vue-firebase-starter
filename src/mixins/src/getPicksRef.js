import firebase from 'firebase'

export default function getPicksRef () {
  return firebase.database().ref(
    '/leagues/' + this.leagueId +
    '/users/' + this.user.uid +
    '/season/' + this.season +
    '/' + this.seasonType +
    '/week/' + this.week
  )
}
