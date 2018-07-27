/**
 * season
 */

var date = new Date()
// if the date is March or earlier, then it is still the previous year's season.
var season = date.getFullYear() - (date.getMonth() < 3 ? 1 : 0)
var preSeasonStartDate = new Date(season + '-08-02 EST')
var regularSeasonStartDate = new Date(season + '-09-06 EST')
// var regularSeasonEndDate = new Date(season, 11, 31, 23, 59, 59)
var seasonType
// var _week = parseInt(location.hash.replace(/^#/, ''), 10)
var week
var minWeek = 0
var maxWeek = 4
var weeks = []

if (date < regularSeasonStartDate) {
  seasonType = 'PRE'
  week = Math.max(0, (date - preSeasonStartDate) / (7 * 24 * 60 * 60 * 1000))
} else {
  seasonType = 'REG'
  week = Math.ceil((date - regularSeasonStartDate) / (7 * 24 * 60 * 60 * 1000))
  minWeek = 1
  maxWeek = 17
  if (week > maxWeek) {
    seasonType = 'POST'
    minWeek = maxWeek + 1
    maxWeek = maxWeek + 5
    week = Math.min(week, maxWeek)
  }
}

// should we use the week in the location hash?
// if (_week >= minWeek && _week <= maxWeek) {
//   week = _week
// }

week = '' + week

// `[...Array(N).keys()]` .. someday
for (var i = minWeek; i <= maxWeek; i++) {
  weeks.push('' + i)
}

export { season }
export { seasonType }
export { week }
export { weeks }
