
export default function lockPicks () {
  if (!this.user || this.isLoading) return
  window.scrollTo(0, 0)
  this.getPicksRef().child('isLocked').set(true).then(() => {
    this.isLoading = false
    this.shouldShowLockPicksDialog = false
    window.scrollTo(0, 0)
  })
}
