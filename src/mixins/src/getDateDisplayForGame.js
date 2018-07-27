
export default function getDateDisplayForGame (game) {
  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var dayOfWeek = dayNames[new Date(game.gameDate).getDay()]
  var timeOfDay = game.gameTimeEastern.split(':')
  var amOrPm = Number(timeOfDay[0]) > 11 ? 'pm' : 'am'
  timeOfDay[0] = Number(timeOfDay[0]) > 12 ? Number(timeOfDay[0]) - 12 : timeOfDay[0]
  timeOfDay = timeOfDay.join(':').replace(/:00$/, '')
  return (
    '<span class="date-header__day">' + dayOfWeek + '</span> ' +
    '<span class="date-header__time">' + timeOfDay + '</span>' +
    '<span class="date-header__am-pm" style="font-size: 75%; color: #999">' + amOrPm + '</span>'
  )
}
