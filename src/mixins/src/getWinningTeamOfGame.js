
export default function getWinningTeamOfGame (game) {
  return /final/i.test(game.phase) && game.homeTeam.score !== game.visitorTeam.score && (
    game.homeTeam.score > game.visitorTeam.score
      ? 'home'
      : 'visitor'
  )
}
