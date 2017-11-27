<template stay-alive>
  <div class="wrapper standings">
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
          />
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
          />
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
        if (val) {
          // get the user ids for the current league
          fetch('https://feeds.nfl.com/feeds-rs/scores.json')
            .then(response => {
              return response.json()
            }).then(json => {
              var weekDb = firebase.database().ref(
                '/schedules/season/' + json.season +
                '/' + json.seasonType +
                '/week/' + json.week
              )
              // [0].pageFunctionResult
              this.isLoading = false
              this.season = json.season
              this.seasonType = json.seasonType
              this.week = json.week
              this.games = json.gameScores
              this.games.forEach(game => {
                // find the matching game in the db and set the score
                if (game.score && game.score.homeTeamScore) {
                  weekDb
                    .orderByChild('gameId')
                    .equalTo(game.gameSchedule.gameId)
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
                    })
                }
              })
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
  .standings
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
