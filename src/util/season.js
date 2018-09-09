/**
 * season
 */

var date = new Date()
// if the date is March or earlier, then it is still the previous year's season.
var season = date.getFullYear() - (date.getMonth() < 3 ? 1 : 0)
// "EDT"
// var preSeasonStartDate = new Date(season + '-08-02T02:00:00-05:00')
// consider starting regular season on Tuesday morning instead of Thursday morning.
var regularSeasonStartDate = new Date(season + '-09-06T02:00:00-05:00')
// var regularSeasonEndDate = new Date(season, 11, 31, 23, 59, 59)
var seasonType
// var _week = parseInt(location.hash.replace(/^#/, ''), 10)
// var _week = parseInt(sessionStorage.week, 10)
var week
var minWeek = 0
var maxWeek = 4
var weeks = []

// Let's just make it REG season for now.
// if (date < regularSeasonStartDate) {
//   seasonType = 'PRE'
//   week = Math.max(0, (date - preSeasonStartDate) / (7 * 24 * 60 * 60 * 1000))
// } else {
seasonType = 'REG'
week = Math.max(1, Math.ceil((date - regularSeasonStartDate) / (7 * 24 * 60 * 60 * 1000)))
minWeek = 1
maxWeek = 17
if (week > maxWeek) {
  seasonType = 'POST'
  minWeek = maxWeek + 1
  maxWeek = maxWeek + 5
  week = Math.min(week, maxWeek)
}
// }

// should we use the week in the sessionStorage? ~location hash?~
// if (_week >= minWeek && _week <= maxWeek) {
//   week = _week
// }

week = '' + (week | 0)

// `[...Array(N).keys()]` .. someday
for (var i = minWeek; i <= maxWeek; i++) {
  weeks.push('' + i)
}

export { season }
export { seasonType }
export { week }
export { weeks }
