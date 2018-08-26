
export default function getWinningTeamOfGame (game) {
  return game.phase === 'FINAL' && (
    game.homeTeam.score > game.visitorTeam.score
      ? 'home'
      : 'visitor'
  )
}
