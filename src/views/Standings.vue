<template>
  <div class="wrapper standings">

    <div class="standings-week">
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
              <Crown
                v-if="index === 0 && allScoresAreFinal"
              ></Crown>
            </td>
            <td>
              {{ user.points }}
            </td>
            <td>
              {{ (user.displayName || 'Anonymous') }}
              <span v-if="0 === 1 && typeof user.totalYards !== 'undefined'">
                <span style="font-size: 75%; color: #999">
                  ({{ user.totalYards }}<span style="font-size: 75%;">yds</span>)
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="standings-season">
      <h2>
        {{ season }} {{ (seasonType === 'REG' ? 'Regular' : seasonType) + ' Season Totals' }}
      </h2>
      <table>
        <tbody>
          <tr
            v-for="(user, index) in seasonStandings"
          >
            <td>
              <Crown
                v-if="false && index === 0 && allScoresAreFinal"
              ></Crown>
            </td>
            <td>
              {{ user.weekPoints }}
            </td>
            <td>
              {{ (user.displayName || 'Anonymous') }}
              <div style="font-size: 70%; color: #aaa;">
                Game Points: {{ user.gamePoints }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="update-scores-link-container"
      v-if="league.owner === user.uid || (week === actualWeek && !allScoresAreFinal)"
    >
      Did a game just end?
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
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import firebase from 'firebase'
  import Crown from '@/components/Crown'
  import TeamCard from '@/components/TeamCard'
  import fetch from 'unfetch'
  import mixins from '@/mixins'
  import { season, seasonType, week, weeks } from '@/util/season'

  export default {
    name: 'Standings',
    mixins: [mixins],
    components: {
      Crown,
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
      seasonStandings () {
        var leagueUsers = (this.league || {}).users || {}
        return (
          Object.keys(leagueUsers || {})
          .map(userId => {
            var leagueUser = leagueUsers[userId || (this.user || {}).uid] || {}
            var leagueUserSeason = (
              leagueUser &&
              leagueUser.season &&
              leagueUser.season[this.season] &&
              leagueUser.season[this.season][this.seasonType]
            )
            return {
              userId: userId,
              displayName: leagueUsers[userId].displayName,
              gamePoints: leagueUserSeason.gamePoints,
              weekPoints: leagueUserSeason.weekPoints,
            }
          })
          .sort((a, b) => {
            return a.weekPoints > b.weekPoints ? -1 : (a.weekPoints === b.weekPoints ? (a.gamePoints > b.gamePoints ? -1 : 1) : 1)
          })
        )
      },
      standings () {
        var J = window.J
        var leagueUsers = this.league.users
        var actualTotalYards = (this.sortedGames[this.sortedGames.length - 1] || {}).totalYards
        // console.log('STANDINGS :: this.league.users', Object.keys(this.league.users || {}))
        // console.log('STANDINGS :: this.games', JSON.stringify(this.games || ''))
        if (this.allScoresAreFinal && !actualTotalYards) return
        console.log('(this.sortedGames[this.sortedGames.length - 1] || {}).homeTeam.score', (this.sortedGames[this.sortedGames.length - 1] || {}).homeTeam.score)
        var _standings = (
          Object.keys(leagueUsers || {})
          .map(userId => {
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
          })
          .sort((userA, userB) => {
            if (userA.points === userB.points) {
              // debugger
              // users will only have 'totalYards' property if they have the same picks
              if (actualTotalYards && userA.totalYards !== undefined && userB.totalYards !== undefined) {
                console.log('both users have totalYards', userA.totalYards, userB.totalYards)
                return Math.abs(userA.totalYards - actualTotalYards) < Math.abs(userB.totalYards - actualTotalYards) ? -1 : 1
              }
              // (reverse operates in-place, so let's use an old-fashioned loop instead)
              var game
              var userAPick
              var userBPick
              var gameSpread
              var userASpreads = []
              var userBSpreads = []
              var userASpread
              var userBSpread
              for (var i = this.sortedGames.length - 1; i >= 0; i--) {
                game = this.sortedGames[i]
                userAPick = userA.picks[game.gameId]
                userBPick = userB.picks[game.gameId]
                if (userAPick !== userBPick) {
                  gameSpread = Math.abs(game.homeTeam.score - game.visitorTeam.score)
                  if (userAPick !== game.winner) {
                    userASpreads.push(gameSpread)
                  } else {
                    userBSpreads.push(gameSpread)
                  }
                }
              }
              // console.log('userASpreads', userASpreads, 'userBSpreads', userBSpreads)
              // if the users have the same # of gamePoints, then they will have the same # of games lost & won,
              // so we don't have to worry about one array being shorter or longer than the other.
              for (var j = 0; j < userASpreads.length; j++) {
                userASpread = userASpreads[j]
                userBSpread = userBSpreads[j]
                if (userASpread !== userBSpread) {
                  return userASpread < userBSpread ? -1 : 1
                }
              }
              // TODO - if we got to HERE, then userA and userB are completely TIED.
            }
            return userA.points > userB.points ? -1 : 1
          })
        )

        // update the db with game points, if we haven't already.
        var leadersPicksForThisWeek = _standings[0] && _standings[0].userId && this.leagueUserPicksForThisWeek(_standings[0].userId)
        console.log('leadersPicksForThisWeek, week', this.week, 'leadersPicksForThisWeek', J(leadersPicksForThisWeek), _standings[0] && _standings[0].userId)
        if (!this.isUpdatingTotals && this.week === this.actualWeek && this.allScoresAreFinal && leadersPicksForThisWeek && !('isWinner' in leadersPicksForThisWeek)) {
          this.isUpdatingScores = true
          _standings.forEach((userWeeklyStanding, i) => {
            var isWinner = i === 0
            var gamePoints = userWeeklyStanding.points
            var weekPoints = isWinner ? 1 : 0
            var userSeasonDb = firebase.database().ref(
              '/leagues/' + this.leagueId +
              '/users/' + userWeeklyStanding.userId +
              '/season/' + this.season +
              '/' + this.seasonType
            )
            var userWeekDb = firebase.database().ref(
              '/leagues/' + this.leagueId +
              '/users/' + userWeeklyStanding.userId +
              '/season/' + this.season +
              '/' + this.seasonType +
              '/week/' + this.week
            )
            userSeasonDb.once('value', snapshot => {
              var dbNode = snapshot.val()
              userWeekDb.child('isWinner').set(isWinner)
              userWeekDb.child('gamePoints').set(gamePoints)
              userSeasonDb.child('weekPoints').set((dbNode.weekPoints || 0) + weekPoints)
              userSeasonDb.child('gamePoints').set((dbNode.gamePoints || 0) + gamePoints)
            })
          })
        }

        return _standings
      },
    },
    data () {
      return {
        isLoading: true,
        isUpdatingScores: false,
        isUpdatingTotals: false,
        canUpdateScores: true,
        timeLastUpdatedScores: 0,
        minTimeBetweenUpdateScores: 9900,
        season: season,
        seasonType: seasonType,
        actualWeek: week,
        week: week,
        weeks: weeks,
        leagueId: '-KzPdROlkcWZDUsd47av',
      }
    },
    watch: {
      user (val) {
        console.log('standings - user watched', val)
        if (val) {
          this.setLeagueRef()
        }
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
      updateScores () {
        var _this = this
        var now = Date.now()
        var gameIdsThatNeedTotalYards = []
        if (now - this.timeLastUpdatedScores > this.minTimeBetweenUpdateScores) {
          this.isUpdatingScores = true
          this.canUpdateScores = false
          this.timeLastUpdatedScores = now
          this.$forceUpdate()
          setTimeout(() => {
            _this.canUpdateScores = _this.canUpdateScores || !_this.isUpdatingScores
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
                            _this.canUpdateScores = Date.now() - _this.timeLastUpdatedScores > _this.minTimeBetweenUpdateScores
                            console.log('can update scores?', _this.canUpdateScores, Date.now() - _this.timeLastUpdatedScores, _this.minTimeBetweenUpdateScores)
                            if (!_this.canUpdateScores) {
                              setTimeout(() => {
                                _this.canUpdateScores = true
                                console.log('can update scores?', _this.canUpdateScores)
                              }, _this.minTimeBetweenUpdateScores - Date.now() - _this.timeLastUpdatedScores)
                            }
                          })
                      }, 5000)
                    })
                } else {
                  _this.isUpdatingScores = false
                  _this.canUpdateScores = Date.now() - _this.timeLastUpdatedScores > _this.minTimeBetweenUpdateScores
                  if (!_this.canUpdateScores) {
                    setTimeout(() => {
                      _this.canUpdateScores = true
                    }, _this.minTimeBetweenUpdateScores - Date.now() - _this.timeLastUpdatedScores)
                  }
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

    .standings-season
      margin-top: 80px
      td
        vertical-align: top

    table
      margin: 0 auto

    td
      padding: 10px
      text-align: right
      + td
        text-align: left

    .update-scores-link-container
      padding-top: 40px
      font-size: 14px

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
