
export default function setPicksRef () {
  if (this.user && this.week) {
    this.$store.dispatch('setPicksRef', this.getPicksRef())
  }
}
