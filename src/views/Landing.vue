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
    <ul v-if="picks.isLocked">
      <template
        v-for="(game, gameIndex) in sortedGames"
      >
        <li
          :class="{
            'date-header': 1,
            'is-same-day': gameIndex && game.gameDate === sortedGames[gameIndex - 1].gameDate
          }"
          v-if="gameIndex === 0 || game.isoTime !== sortedGames[gameIndex - 1].isoTime"
          v-html="getDateDisplayForGame(game)"
        ></li>
        <li
          :class="{
            // if everybody picked the same team, the game is irrelevant
            'is-game-irrelevant': numLeagueUsers === Math.max(
              (leagueUserPicks[game.gameId] || [[], []])[0].length,
              (leagueUserPicks[game.gameId] || [[], []])[1].length
            )
          }"
        >
          <team-card
            :team="game.visitorTeam"
            :isPicked="game.winner === 'visitor'"
            :usersWhoPickedThisTeam="(leagueUserPicks[game.gameId] || [[], []])[0]"
          ></team-card>
          <span class="score" :data-is-winner="game.winner === 'visitor'">
            {{ game.visitorTeam.score || '&nbsp; &nbsp;' }}
          </span>
          <span style="display: none; width: 10px;">&nbsp;</span>
          <span class="score" :data-is-winner="game.winner === 'home'">
            {{ game.homeTeam.score || '&nbsp; &nbsp;' }}
          </span>
          <team-card
            :team="game.homeTeam"
            :isPicked="game.winner === 'home'"
            :usersWhoPickedThisTeam="(leagueUserPicks[game.gameId] || [[], []])[1]"
          ></team-card>
        </li>
      </template>
    </ul>
    <div v-if="!picks.isLocked" class="must-have-all-picks-notice">
      Once you <a href="/picks">make your picks</a> for the week and lock them in,
      you can see your King of Football member picks and standings here.<br/><br/>
      (If you already made your picks and locked them in, you may need to refresh this page.
      Sorry for the inconvenience.)
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import firebase from 'firebase'
  import TeamCard from '@/components/TeamCard'

  export default {
    name: 'Landing',
    components: {
      TeamCard,
    },
    computed: {
      ...mapState({
        user: 'user',
        league: 'league',
        games: 'games',
      }),
      sortedGames () {
        // javascript `sort` operates in-place
        this.games.sort((game1, game2) => {
          return game1.gameId < game2.gameId ? -1 : 1
        })
        return this.games
      },
      picks () {
        console.log('computing `picks`')
        return this.leagueUserPicksForThisWeek() || {}
      },
      numLeagueUsers () {
        return Object.keys(this.league.users || {}).length
      },
      leagueUserPicks () {
        var leagueUserPicks = {}
        var leagueUsers = this.league.users
        Object.keys(leagueUsers || {}).forEach(userId => {
          var leagueUserPicksForThisWeek = this.leagueUserPicksForThisWeek(userId)
          if (leagueUserPicksForThisWeek) {
            Object.keys(leagueUserPicksForThisWeek || {}).forEach(gameId => {
              // people who picked the visitor team [], people who picked the home team [].
              leagueUserPicks[gameId] = leagueUserPicks[gameId] || [[], []]
              leagueUserPicks[gameId][+leagueUserPicksForThisWeek[gameId]].push({
                userId: userId,
                displayName: leagueUsers[userId].displayName,
              })
            })
          }
        })
        return leagueUserPicks
      },
    },
    data () {
      var date = new Date()
      var season = date.getFullYear() - (date.getMonth > 2 ? 1 : 0)
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
        season: season,
        seasonType: seasonType,
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
        console.log('on league updated', val)
        this.isLoading = false
      },
      week (val) {
        console.log('on week updated', val)
      },
    },
    mounted () {
      this.setWeek()
    },
    methods: {
      setWeek (week) {
        // console.log(this.week, arguments)
        this.$store.dispatch('setGamesRef', firebase.database().ref(
          '/schedules/season/' + this.season +
          '/' + this.seasonType +
          '/week/' + (week || this.week)
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
    .is-game-irrelevant
      opacity: .7
      transform: scale(.9)
    .date-header
      display: block
      margin: 0 0 20px
      &__day
        display: block
        margin: 0 0 30px
        padding: 10px 0
        border-bottom: 1px solid #aaa
      &.is-same-day
        .date-header__day
          display: none

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
