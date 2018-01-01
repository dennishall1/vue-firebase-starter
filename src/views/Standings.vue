<template>
  <div class="wrapper standings">
    <h1>
      Week
      <mu-select-field v-model="week" @change="setWeek">
        <mu-menu-item
          v-for="_week in weeks"
          :key="_week"
          :value="_week"
          :title="_week"
        ></mu-menu-item>
      </mu-select-field>
    </h1>
    <table>
      <tbody>
        <tr
          v-for="(user, index) in standings"
        >
          <td>
            <!-- crown-simple.svg -->
            <svg
              v-if="index === 0 && allScoresAreFinal"
              xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 168.52 168.52"
            >
              <path style="fill: #00adea" d="M151.9 51.46c-9.2 0-16.66 7.47-16.66 16.65 0 4.93 2.18 9.3 5.6 12.36L119.8 88l-29.9-35.54c6.46-2.3 11.1-8.4 11.1-15.63.02-9.18-7.45-16.65-16.63-16.65-9.2 0-16.66 7.47-16.66 16.65 0 7.16 4.57 13.22 10.9 15.57L48.72 88l-20.98-7.54c3.4-3.05 5.58-7.43 5.58-12.35 0-9.17-7.47-16.64-16.65-16.64C7.48 51.46 0 58.93 0 68.1c0 7.82 5.44 14.36 12.7 16.14v45.12c0 .32.13.6.2.88-.12.46-.2.93-.2 1.43 0 16.2 64.24 16.68 71.56 16.68 7.32 0 71.55-.48 71.55-16.68 0-.5-.05-.97-.17-1.43.08-.3.18-.56.18-.88V84.24c7.3-1.78 12.72-8.32 12.72-16.13 0-9.17-7.45-16.64-16.63-16.64zM75.83 36.83c0-4.7 3.84-8.55 8.55-8.55 4.7 0 8.54 3.84 8.54 8.55 0 4.72-3.84 8.55-8.55 8.55-4.72 0-8.56-3.83-8.56-8.55zM48.64 96.6c1.58.56 3.37.08 4.46-1.23L84.27 58.3l31.17 37.1c1.1 1.28 2.87 1.76 4.46 1.2l27.8-10v36.48c-17.5-7.8-57.73-8.08-63.44-8.08-5.7 0-45.95.3-63.45 8.08v-36.5l27.83 10zm35.63 43.65c-31.2 0-51.07-3.72-59.34-6.84-1.63-.6-2.85-1.2-3.57-1.73 2.58-1.9 10.97-4.53 24.97-6.36 9.87-1.3 22.5-2.2 37.94-2.2s28.1.9 37.95 2.2c14 1.84 22.4 4.46 24.97 6.37-.74.54-1.95 1.13-3.57 1.74-8.27 3.14-28.15 6.85-59.36 6.85zM8.12 68.1c0-4.7 3.84-8.54 8.55-8.54s8.55 3.84 8.55 8.55c0 4.72-3.84 8.56-8.55 8.56s-8.55-3.84-8.55-8.55zm143.77 8.56c-4.72 0-8.56-3.84-8.56-8.55 0-4.7 3.84-8.54 8.55-8.54 4.7 0 8.54 3.84 8.54 8.55 0 4.72-3.84 8.56-8.55 8.56z"></path>
            </svg>
          </td>
          <td>
            {{ user.points }}
          </td>
          <td>
            {{ user.displayName }}
            <span v-if="0 === 1 && typeof user.totalYards !== 'undefined'">
              <span style="font-size: 75%; color: #999">
                ({{ user.totalYards }}<span style="font-size: 75%;">yds</span>)
              </span>
            </span>
          </td>
        </tr>
        <tr>
          <td
            colspan="3"
            v-if="week === actualWeek"
          >
            Did a game just end?
            <!-- todo: don't show this if we already have all the data we need -->
            <!-- todo: automate this instead -->
            <a
              :class="{
                'update-scores-link': true,
                'loading': !this.canUpdateScores,
              }"
              @click="updateScores"
            >
              Update Scores
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import firebase from 'firebase'
  import TeamCard from '@/components/TeamCard'
  import fetch from 'unfetch'

  export default {
    name: 'Standings',
    components: {
      TeamCard,
    },
    computed: {
      ...mapState({
        user: 'user',
        league: 'league',
        games: 'games',
      }),
      allScoresAreFinal () {
        return !this.games.some(game => {
          return game.phase !== 'FINAL'
        })
      },
      numLeagueUsers () {
        return Object.keys(this.league.users || {}).length
      },
      sortedGames () {
        // javascript `sort` operates in-place
        this.games.sort((game1, game2) => {
          return game1.isoTime !== game2.isoTime
            ? (game1.isoTime < game2.isoTime ? -1 : 1)
            : (game1.gameId < game2.gameId ? -1 : 1)
        })
        return this.games
      },
      standings () {
        var leagueUsers = this.league.users
        var actualTotalYards = (this.sortedGames[this.sortedGames.length - 1] || {}).totalYards
        // console.log('STANDINGS :: this.league.users', Object.keys(this.league.users || {}))
        // console.log('STANDINGS :: this.games', JSON.stringify(this.games || ''))
        return Object.keys(leagueUsers || {}).map(userId => {
          var leagueUserPicksForThisWeek = this.leagueUserPicksForThisWeek(userId)
          return {
            userId: userId,
            displayName: leagueUsers[userId].displayName,
            picks: leagueUserPicksForThisWeek || {},
            totalYards: (leagueUserPicksForThisWeek || {}).totalYards,
            points: Object.keys(leagueUserPicksForThisWeek || {}).reduce((points, gameId) => {
              var game = this.games.find(game => { return '' + game.gameId === '' + gameId })
              // console.log('userId', userId, 'gameId', gameId, 'game', game, game && (game.homeTeam.score + ', ' + game.visitorTeam.score))
              if (!game) return points
              game.winner = '' + Number(game.homeTeam.score > game.visitorTeam.score)
              return points + (
                game.phase === 'FINAL' &&
                leagueUserPicksForThisWeek[gameId] === game.winner
                  ? 1
                  : 0
              )
            }, 0),
          }
        }).sort((userA, userB) => {
          if (userA.points === userB.points) {
            // users will only have 'totalYards' property if they have the same picks
            if (actualTotalYards && 'totalYards' in userA && 'totalYards' in userB) {
              return Math.abs(userA.totalYards - actualTotalYards) < Math.abs(userB.totalYards - actualTotalYards) ? -1 : 1
            }
            // (reverse operates in-place, so let's use an old-fashioned loop instead)
            var userASpread
            var userBSpread
            var userAPick
            var userBPick
            var game
            var gameSpread
            for (var i = this.sortedGames.length - 1; i >= 0; i--) {
              game = this.sortedGames[i]
              userAPick = userA.picks[game.gameId]
              userBPick = userB.picks[game.gameId]
              if (userAPick !== userBPick) {
                gameSpread = Math.abs(game.homeTeam.score - game.visitorTeam.score)
                if (userAPick === game.winner) {
                  userASpread = gameSpread
                } else {
                  userBSpread = gameSpread
                }
              }
            }
            return userASpread > userBSpread ? -1 : 1
          }
          return userA.points > userB.points ? -1 : 1
        })
      },
    },
    data () {
      var date = new Date()
      // if the date is March or earlier, then it is still the previous year's season.
      var season = date.getFullYear() - (date.getMonth() < 3 ? 1 : 0)
      // var Wednesday = 3
      // update each year:
      var preSeasonStartDate = new Date('2017-08-02 EST')
      var regularSeasonStartDate = new Date('2017-09-06 EST')
      // var regularSeasonEndDate = new Date(season, 11, 31, 23, 59, 59)
      var seasonType
      var week
      var minWeek
      var maxWeek
      var weeks = []

      if (date < regularSeasonStartDate) {
        seasonType = 'PRE'
        week = Math.max(0, (date - preSeasonStartDate) / (7 * 24 * 60 * 60 * 1000))
        minWeek = 0
        maxWeek = 4
      } else {
        seasonType = 'REG'
        week = Math.min(17, Math.ceil((date - regularSeasonStartDate) / (7 * 24 * 60 * 60 * 1000)))
        minWeek = 1
        maxWeek = 17
      }

      week = '' + week

      // `[...Array(N).keys()]` .. someday
      for (var i = minWeek; i <= maxWeek; i++) {
        weeks.push('' + i)
      }

      return {
        isLoading: true,
        isUpdatingScores: false,
        canUpdateScores: true,
        timeLastUpdatedScores: 0,
        minTimeBetweenUpdateScores: 5000,
        season: season,
        seasonType: seasonType,
        actualWeek: week,
        week: week,
        weeks: weeks,
        leagueId: '-KzPdROlkcWZDUsd47av',
      }
    },
    watch: {
      user () {
        this.setLeagueRef()
      },
      league (val) {
        // console.log('on league updated', val)
        this.isLoading = this.games.length === 0 && this.league.users
      },
      // week (val) {
      //   console.log('on week updated', val)
      // },
      games (val) {
        // console.log('on games updated', this.week, typeof this.week, this.league.users, val)
        this.isLoading = this.games.length === 0 && this.league.users
      },
    },
    mounted () {
      this.setWeek()
    },
    methods: {
      setWeek (week) {
        // console.log(this.week, arguments)
        if (week || week === 0) {
          this.week = '' + week
        }
        this.$store.dispatch('setGamesRef', firebase.database().ref(
          '/schedules/season/' + this.season +
          '/' + this.seasonType +
          '/week/' + this.week
        ))
      },
      setLeagueRef () {
        // console.log(this.week, arguments)
        this.$store.dispatch('setLeagueRef', firebase.database().ref(
          '/leagues/' + this.leagueId
        ))
      },
      leagueUserPicksForThisWeek (userId) {
        var leagueUsers = (this.league || {}).users || {}
        var leagueUser = leagueUsers[userId || (this.user || {}).uid] || {}
        return (
          leagueUser.season &&
          leagueUser.season[this.season] &&
          leagueUser.season[this.season][this.seasonType] &&
          leagueUser.season[this.season][this.seasonType].week[this.week]
        )
      },
      getDateDisplayForGame (game) {
        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        var dayOfWeek = dayNames[new Date(game.gameDate).getDay()]
        var timeOfDay = game.gameTimeEastern.split(':')
        var amOrPm = Number(timeOfDay[0]) > 11 ? 'pm' : 'am'
        timeOfDay[0] = Number(timeOfDay[0]) > 12 ? Number(timeOfDay[0]) - 12 : timeOfDay[0]
        timeOfDay = timeOfDay.join(':').replace(/:00$/, '')
        return '<span class="date-header__day">' + dayOfWeek + '</span> ' + timeOfDay + ' ' + amOrPm
      },
      updateScores () {
        var _this = this
        var now = Date.now()
        var gameIdsThatNeedTotalYards = []
        if (now - this.timeLastUpdatedScores > this.minTimeBetweenUpdateScores) {
          this.isUpdatingScores = true
          this.timeLastUpdatedScores = now
          setTimeout(() => {
            this.canUpdateScores = !this.isUpdatingScores
          }, this.minTimeBetweenUpdateScores)

          fetch('https://feeds.nfl.com/feeds-rs/scores.json')
            .then(response => {
              return response.json()
            })
            .then(json => {
              var numGamesProcessed = 0
              var numGames = json.gameScores.length
              var weekDb = firebase.database().ref(
                '/schedules/season/' + json.season +
                '/' + json.seasonType +
                '/week/' + json.week
              )
              json.gameScores.forEach(game => {
                // find the matching game in the db and set the score
                var gameId = game.gameSchedule.gameId
                var gameFromSchedule = this.games.find(game => {
                  return '' + game.gameId === '' + gameId
                })
                console.log(gameId, 'gameFromSchedule', gameFromSchedule, game)
                if (gameFromSchedule && game.gameSchedule.isoTime !== gameFromSchedule.isoTime) {
                  weekDb
                    .orderByChild('gameId')
                    .equalTo(gameId)
                    .once('value', snapshot => {
                      var gameFromDb = snapshot.val()
                      var key = Object.keys(gameFromDb)[0]
                      // we have to create a nearly identical updateObject, and can't just use the gameFromDb directly,
                      // because firebase snapshot val() may 'optimize' objects with numeric keys as if they were arrays
                      // and introduce nulls -- i.e., key = 1, snapshot val = [null, {game}]
                      var updateObject = {}
                      updateObject[key] = gameFromDb[key]
                      // console.log('gameId', game.gameSchedule.gameId, 'key', key, 'snapshot val', snapshot.val())
                      updateObject[key].gameDate = game.gameSchedule.gameDate
                      updateObject[key].gameTimeEastern = game.gameSchedule.gameTimeEastern
                      updateObject[key].gameTimeLocal = game.gameSchedule.gameTimeLocal
                      updateObject[key].isoTime = game.gameSchedule.isoTime
                      snapshot.ref.update(updateObject)
                    })
                }

                if (game.score && game.score.homeTeamScore) {
                  weekDb
                    .orderByChild('gameId')
                    .equalTo(gameId)
                    .once('value', snapshot => {
                      var gameFromDb = snapshot.val()
                      var key = Object.keys(gameFromDb)[0]
                      // we have to create a nearly identical updateObject, and can't just use the gameFromDb directly,
                      // because firebase snapshot val() may 'optimize' objects with numeric keys as if they were arrays
                      // and introduce nulls -- i.e., key = 1, snapshot val = [null, {game}]
                      var updateObject = {}
                      updateObject[key] = gameFromDb[key]
                      // console.log('gameId', game.gameSchedule.gameId, 'key', key, 'snapshot val', snapshot.val())
                      updateObject[key].homeTeam.score = game.score.homeTeamScore.pointTotal
                      updateObject[key].visitorTeam.score = game.score.visitorTeamScore.pointTotal
                      updateObject[key].phase = game.score.phase
                      snapshot.ref.update(updateObject)
                      // if the score is final, and we don't already have the totalYards, flag this game as needing to get the total yards
                      console.log('totalYards ?', gameId, game.score.phase, gameFromDb.totalYards, game.score.phase === 'FINAL', !gameFromDb.totalYards)
                      if (game.score.phase === 'FINAL' && !gameFromDb.totalYards) {
                        gameIdsThatNeedTotalYards.push(gameId)
                        // fetch('https://corsify.appspot.com/http://www.nfl.com/liveupdate/game-center/' + gameId + '/' + gameId + '_gtd.json')
                      }
                      numGamesProcessed++
                    })
                } else {
                  numGamesProcessed++
                }
              })

              var _start = Date.now()
              console.log('start waiting for all games to have evaluation of whether they need totalYards', new Date())
              // update the total yards
              function updateYards () {
                if (numGamesProcessed !== numGames) {
                  setTimeout(updateYards, 300)
                }
                console.log('done waiting .. ', Date.now() - _start, new Date())
                if (gameIdsThatNeedTotalYards.length) {
                  // process the games that need total yards
                  fetch('https://api.apify.com/v2/acts/dbh~game-stats/runs', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({gameIds: gameIdsThatNeedTotalYards}),
                  })
                    .then(r => {
                      return r.json()
                    })
                    .then(json => {
                      console.log('apify act response:', json)
                      // give it a little time to make sure it's there.
                      setTimeout(() => {
                        fetch(`https://api.apify.com/v2/key-value-stores/${json.data.defaultKeyValueStoreId}/records/OUTPUT`)
                          .then(r => {
                            return r.json()
                          })
                          .then(json => {
                            console.log('apify key value store response:', json)
                            if (json.error) {
                              console.error(json.error.message)
                              return
                            }
                            if (typeof json === 'string') {
                              json = JSON.parse(json)
                            }
                            gameIdsThatNeedTotalYards.forEach(gameId => {
                              weekDb
                                .orderByChild('gameId')
                                .equalTo(gameId)
                                .once('value', snapshot => {
                                  var gameFromDb = snapshot.val()
                                  var key = Object.keys(gameFromDb)[0]
                                  // we have to create a nearly identical updateObject, and can't just use the gameFromDb directly,
                                  // because firebase snapshot val() may 'optimize' objects with numeric keys as if they were arrays
                                  // and introduce nulls -- i.e., key = 1, snapshot val = [null, {game}]
                                  var updateObject = {}
                                  updateObject[key] = gameFromDb[key]
                                  // var stats = json[gameId]
                                  updateObject[key].totalYards = json['' + gameId].home.stats.team.totyds + json['' + gameId].away.stats.team.totyds
                                  snapshot.ref.update(updateObject)
                                })
                            })
                            _this.isUpdatingScores = false
                            _this.canUpdateScores = now - this.timeLastUpdatedScores > this.minTimeBetweenUpdateScores
                          })
                      }, 5000)
                    })
                } else {
                  _this.isUpdatingScores = false
                  _this.canUpdateScores = now - this.timeLastUpdatedScores > this.minTimeBetweenUpdateScores
                }
              }
              updateYards()

              console.log('parsed json', json.gameScores)
            }).catch(ex => {
              _this.isUpdatingScores = false
              _this.canUpdateScores = true
              console.log('parsing failed', ex)
            })
        }
      },
    },
  }
</script>

<style lang="sass">
  .standings
    text-align: center
    padding: 20px 20px 90px

    h1
      font-family: bold-cond, sans-serif
      font-size: 50px

    h1, h2
      font-weight: normal
      color: white

    table
      margin: 0 auto

    td
      padding: 10px
      text-align: right
      + td
        text-align: left

    tr:last-child
      td
        padding-top: 40px
        font-size: 14px
        text-transform: none

    .update-scores-link
      display: inline-block
      position: relative
      margin: 0 10px
      cursor: pointer
      &.loading
        color: gray
        cursor: not-allowed

    @keyframes spinner
      to
        transform: rotate(360deg)

    .loading:before
      content: ''
      box-sizing: border-box
      position: absolute
      top: 50%
      right: -30px
      width: 20px
      height: 20px
      margin-top: -10px
      margin-left: -10px
      border-radius: 50%
      border: 2px solid #ccc
      border-top-color: #333
      animation: spinner .6s linear infinite

    .must-have-all-picks-notice
      padding-top: 30px

    .mu-text-field
      width: 80px
    .mu-select-field
      .mu-dropDown-menu
        height: auto
        font-size: 50px
      .mu-dropDown-menu-text
        color: #00adea
        height: 37px
        line-height: 37px
      .mu-dropDown-menu-icon
        color: #00adea
      .mu-text-field-line
        background: #aaa


    @media (max-width: 600px)
      h1
        font-size: 40px
      h3
        text-align: center

      .team-card
        width: auto
        display: block
        &.game-has-pick:not(.picked)
          opacity: .7
        &__image
          width: 100px
          height: auto
      .score
        font-size: 30px
        padding-top: 55px

</style>
