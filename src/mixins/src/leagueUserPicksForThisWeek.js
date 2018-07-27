
export default function leagueUserPicksForThisWeek (userId) {
  var leagueUsers = (this.league || {}).users || {}
  var leagueUser = leagueUsers[userId || (this.user || {}).uid] || {}
  return (
    leagueUser.season &&
    leagueUser.season[this.season] &&
    leagueUser.season[this.season][this.seasonType] &&
    leagueUser.season[this.season][this.seasonType].week[this.week]
  )
}
