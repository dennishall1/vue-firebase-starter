
export default function lockTotalYards () {
  if (!this.user || this.isLoading) return
  window.scrollTo(0, 0)
  this.getPicksRef().child('totalYards').set(this.totalYards)
  this.getPicksRef().child('isTotalYardsLocked').set(true).then(() => {
    this.isLoading = false
    this.shouldShowLockTotalYardsDialog = false
  })
}
