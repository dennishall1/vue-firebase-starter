<template stay-alive>
  <div class="wrapper scores">
    <h1>Week {{ week }}</h1>
    <ul>
      <template
        v-for="(game, gameIndex) in games"
      >
        <li
          class="date-header"
          v-if="!game.isSameTimeAsPreviousGame"
        >
          {{ game.displayDate }}
        </li>
        <li>
          <team-card
            :team="game.gameSchedule.visitorTeam"
            :isPicked="game.winner === 'visitor'"
          ></team-card>
          <span class="score" :data-is-winner="game.winner === 'visitor'">
            {{ game.gameSchedule.visitorTeam.score || '&nbsp; &nbsp;' }}
          </span>
          <span style="display: none; width: 10px;">&nbsp;</span>
          <span class="score" :data-is-winner="game.winner === 'home'">
            {{ game.gameSchedule.homeTeam.score || '&nbsp; &nbsp;' }}
          </span>
          <team-card
            :team="game.gameSchedule.homeTeam"
            :isPicked="game.winner === 'home'"
          ></team-card>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import firebase from 'firebase'
  import fetch from 'unfetch'
  import TeamCard from '@/components/TeamCard'

  export default {
    name: 'UpdateScores',
    components: {
      TeamCard,
    },
    computed: {
      ...mapState({
        user: 'user',
      }),
    },
    data () {
      return {
        isLoading: true,
        season: null,
        seasonType: null,
        week: null,
        games: [],
        picks: {},
        leagueId: '-KzPdROlkcWZDUsd47av',
        league: {},
        leagueUserPicks: {},
      }
    },
    watch: {
      user (val) {
        var _week = '1'
        if (val) {
          // get the user ids for the current league
          fetch('https://api.apify.com/v1/rs7ntQdHsu4L2g8iA/crawlers/5cCo62Xs7omPRqtNR/lastExec/results?token=icrF4BDXjBePhFcqHFmtd9rf9&format=json&status=SUCCEEDED&r=102')
            .then(response => {
              return response.json()
            }).then(json => {
              var weekDb = firebase.database().ref('/schedules/season/2018/PRE/week/' + _week)
              console.log('apify json', json)
              console.log('firebase json', JSON.stringify(weekDb))
              this.isLoading = false
              this.season = '2018'
              this.seasonType = 'PRE'
              this.week = _week
              json[0].pageFunctionResult.forEach(game => {
                // find the matching game in the db and set the score
                console.log('game from json', game.gameId, game)
                if ('score' in game.homeTeam) {
                  weekDb
                    .orderByChild('gameId')
                    .equalTo(+game.gameId)
                    .once('value', snapshot => {
                      var gameFromDb = snapshot.val()
                      var key = Object.keys(gameFromDb)[0]
                      console.log('scores', game.homeTeam.score, game.visitorTeam.score)
                      if (game.homeTeam.score === game.visitorTeam.score) {
                        console.warn('tied game', game.visitorTeam.nick, '@', game.homeTeam.nick)
                      }
                      // we have to create a nearly identical updateObject, and can't just use the gameFromDb directly,
                      // because firebase snapshot val() may 'optimize' objects with numeric keys as if they were arrays
                      // and introduce nulls -- i.e., key = 1, snapshot val = [null, {game}]
                      var updateObject = {}
                      updateObject[key] = gameFromDb[key]
                      // console.log('gameId', game.gameSchedule.gameId, 'key', key, 'snapshot val', snapshot.val())
                      updateObject[key].homeTeam.score = game.homeTeam.score
                      updateObject[key].visitorTeam.score = game.visitorTeam.score
                      updateObject[key].phase = 'FINAL'
                      snapshot.ref.update(updateObject)
                    })
                }
              })
              console.log('parsed json', this.games)
            }).catch(ex => {
              console.log('parsing failed', ex)
            })
        }

        var date = new Date()
        // if the date is March or earlier, then it is still the previous year's season.
        var season = date.getFullYear() - (date.getMonth() < 3 ? 1 : 0)
        var preSeasonStartDate = new Date(season + '-08-02 EST')
        var regularSeasonStartDate = new Date(season + '-09-06 EST')
        // var regularSeasonEndDate = new Date(season, 11, 31, 23, 59, 59)
        var seasonType
        var week
        var maxWeek

        if (date < regularSeasonStartDate) {
          seasonType = 'PRE'
          week = Math.max(0, (date - preSeasonStartDate) / (7 * 24 * 60 * 60 * 1000))
          maxWeek = 4
        } else {
          seasonType = 'REG'
          week = Math.ceil((date - regularSeasonStartDate) / (7 * 24 * 60 * 60 * 1000))
          maxWeek = 17
          if (week > maxWeek) {
            seasonType = 'POST'
            maxWeek = maxWeek + 4
            week = Math.min(week, maxWeek)
          }
        }
        week = '' + week
        if (seasonType === 'PRE') {
          fetch('https://api.apify.com/v1/rs7ntQdHsu4L2g8iA/crawlers/5cCo62Xs7omPRqtNR/lastExec/results?token=icrF4BDXjBePhFcqHFmtd9rf9&format=json&status=SUCCEEDED')
            .then(response => {
              return response.json()
            }).then(json => {
              this.isLoading = false
              this.season = season
              this.seasonType = seasonType
              var updateObj = []
              json[0].pageFunctionResult.forEach(game => {
                var week = this.week = '' + (game.week || Math.max(0, Math.ceil((new Date(game.isoTime) - regularSeasonStartDate) / (7 * 24 * 60 * 60 * 1000))))
                // find the matching game in the db and set the score
                console.log('game from json', 'week', week, 'gameId', game.gameId, 'game', game)
                updateObj.push(game)
              })
              firebase.database().ref(`/schedules/season/${season}/PRE/week/${this.week}`).set(updateObj)
              console.log('parsed json', this.games)
            }).catch(ex => {
              console.log('parsing failed', ex)
            })
        }
      },
    },
  }
</script>

<style lang="sass">
  .scores
    text-align: center
    padding: 20px 20px 90px

    h1
      font-family: bold-cond, sans-serif
      font-size: 50px

    h1, h2
      font-weight: normal
      color: white

    ul
      list-style-type: none
      padding: 0
      display: inline-flex
      flex-direction: column

    li
      display: flex
      margin: 0 0 40px
      justify-content: center
      align-items: flex-start
      &.date-header
        margin: 0 0 20px
        padding: 10px 0
        border-bottom: 1px solid #aaa

    .team-card
      width: 315px
      cursor: pointer
      display: flex
      align-items: flex-start
      flex-direction: row-reverse
      justify-content: space-between
      text-align: right
      &__image
        width: 100px
        height: auto
    .team-card-wrapper
      text-align: right
      & ~ .team-card-wrapper
        text-align: left
        .team-card
          flex-direction: row
          text-align: left

    .score
      color: #999
      font-size: 60px
      width: 70px
      text-align: center
      padding: 10px 0 0

    .score[data-is-winner="true"]
      color: #00adea

    .must-have-all-picks-notice
      padding-top: 30px


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
