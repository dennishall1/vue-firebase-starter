
export default function toggleTeamPick (gameId, teamIndex) {
  if (this.picks.isLocked || !this.user || this.isLoading) {
    return
  }
  this.isLoading = true
  // this.picks['' + gameId] = teamIndex
  console.log('toggleTeamPick', gameId, teamIndex)
  this.getPicksRef().child('' + gameId).set('' + teamIndex).then(() => {
    this.isLoading = false
  })
}
