
export default function getWinningTeamOfGame (game) {
  return game.phase !== 'FINAL' ? null
    : game.homeTeam.score > game.visitorTeam.score ? 'home' : 'visitor'
}
