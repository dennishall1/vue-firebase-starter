<template>
  <div class="wrapper">
    <h1>Standings</h1>
    <ul v-if="Object.keys(picks).length === games.length">
      <li v-for="(game, gameIndex) in games">
        <team-card
          stay-alive
          :team="game.gameSchedule.visitorTeam"
          :isPicked="game.winner === 'visitor'"
          :usersWhoPickedThisTeam="leagueUserPicks[getGameKey(gameIndex, 0)]"
        />
        <span class="score" :data-is-winner="game.winner === 'visitor'">
          {{ game.gameSchedule.visitorTeam.score || '&nbsp; &nbsp;' }}
        </span>
        <span style="display: inline-block; width: 10px;">&nbsp;</span>
        <span class="score" :data-is-winner="game.winner === 'home'">
          {{ game.gameSchedule.homeTeam.score || '&nbsp; &nbsp;' }}
        </span>
        <team-card
          stay-alive
          :team="game.gameSchedule.homeTeam"
          :isPicked="game.winner === 'home'"
          :usersWhoPickedThisTeam="leagueUserPicks[getGameKey(gameIndex, 1)]"
        />
      </li>
    </ul>
    <div v-if="Object.keys(picks).length === 0" class="must-have-all-picks-notice">
      Once you make your picks for the week and lock them in,
      you can see your King of Football member picks and standings here.
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import firebase from 'firebase'
  // import 'whatwg-fetch'
  import fetch from 'unfetch'
  import TeamCard from '@/components/TeamCard'

  export default {
    name: 'Landing',
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
        if (val) {
          // get the user ids for the current league
          firebase.database()
            .ref('leagues/' + this.leagueId)
            .once('value').then(snapshot => {
              this.league = snapshot.val()
              this.league.users[this.user.uid].isCurrentUser = true
              console.log('watch user - league', this.league)
              Object.keys(this.league.users).forEach(userUid => {
                firebase.database()
                  .ref('picks/user/' + userUid + '/season/' + this.season + '/' + this.seasonType + '/week/' + this.week + '/game')
                  .on('value', snapshot => {
                    var res = snapshot.val()
                    if (this.user.uid === userUid) {
                      console.log('found current user\'s picks')
                      this.picks = res
                    }
                    console.log('watch user - league user picks', res)
                    res && Object.keys(res).forEach(gameIndex => {
                      var key = this.getGameKey(gameIndex, res[gameIndex])
                      this.leagueUserPicks[key] = this.leagueUserPicks[key] || []
                      this.leagueUserPicks[key].push(this.league.users[userUid])
                    })
                  })
              })
            })
        }
      },
    },
    mounted () {
      this.getData()
    },
    methods: {
      getGameKey (gameIndex, teamIndex) {
        return [
          this.season,
          this.seasonType,
          this.week,
          '_',
          gameIndex,
          '_',
          teamIndex,
        ].join('')
      },
      getData () {
        // get the games
        // https://feeds.nfl.com/feeds-rs/scores.json
        // https://feeds.nfl.com/feeds-rs/schedules.json
        // https://api.apify.com/v1/rs7ntQdHsu4L2g8iA/crawlers/5cCo62Xs7omPRqtNR/lastExec/results?token=icrF4BDXjBePhFcqHFmtd9rf9&format=json&status=SUCCEEDED
        /** /
        fetch('https://feeds.nfl.com/feeds-rs/schedules.json')
          .then(res => {
            return res.json()
          }).then(json => {
            // todo: update the data structure to store BY WEEK
            var schedule = json.gameSchedules.reduce((_schedule, item) => {
              _schedule[item.seasonType].week[item.week] = item
              return _schedule
            }, {PRE: {week: {}}, REG: {week: {}}, POST: {week: {}})
            console.log('schedule', schedule)
            firebase.database()
              .ref('schedules/season/' + json.season)
              .set(schedule)
          })
        /**/

        /** /
        firebase.database()
         .ref('leagues/-KzPdROlkcWZDUsd47av/users/Wi08mzprabaxGzblbkzI77OzyDi1')
         .set({
           displayName: 'Ted Tester',
         })
        /**/

        /** /
        firebase.database()
          .ref('users')
          .set({
            'f4RII3j8j0OM7pAAEiOOXiTnFLY2': {
              leagues: {
                '-KzPdROlkcWZDUsd47av': 1,
              },
            },
            'Wi08mzprabaxGzblbkzI77OzyDi1': {
              leagues: {
                '-KzPdROlkcWZDUsd47av': 1,
              },
            },
          })
        /**/

        fetch('https://feeds.nfl.com/feeds-rs/scores.json')
          .then(response => {
            return response.json()
          }).then(json => {
            // [0].pageFunctionResult
            this.isLoading = false
            this.season = json.season
            this.seasonType = json.seasonType
            this.week = json.week
            this.games = json.gameScores
            this.games.forEach(game => {
              if (game.score && game.score.phase === 'FINAL') {
                let homeTeamScore = game.score.homeTeamScore.pointTotal
                let visitorTeamScore = game.score.visitorTeamScore.pointTotal
                game.gameSchedule.homeTeam.score = homeTeamScore
                game.gameSchedule.visitorTeam.score = visitorTeamScore
                game.winner = visitorTeamScore > homeTeamScore ? 'visitor' : 'home'
              }
            })

            console.log('parsed json', this.games)
          }).catch(ex => {
            console.log('parsing failed', ex)
          })
      },
    },
  }
</script>

<style lang="sass">
  .wrapper
    text-align: center
    padding: 20px 20px 90px

  h1
    font-family: bold-cond
    font-size: 50px

  h1, h2
    font-weight: normal
    color: white

  ul
    list-style-type: none
    padding: 0

  li
    display: flex
    margin: 0 0 40px
    justify-content: center
    align-items: flex-start

  .team-card
    width: 300px
    cursor: pointer
    display: flex
    align-items: flex-start
    flex-direction: row-reverse
    justify-content: space-between
    text-align: right
    &__image
      width: 100px
      height: auto
  .team-card-wrapper ~ .team-card-wrapper
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

    li
      align-items: flex-start

    .team-card
      width: auto
      display: block
      &.game-has-pick:not(.picked)
        opacity: .7
      &__image
        width: 100px
        height: auto

</style>
