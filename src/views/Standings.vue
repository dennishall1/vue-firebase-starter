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
          v-for="user in standings"
        >
          <td>
            {{ user.points }}
          </td>
          <td>
            {{ user.displayName }}
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
      picks () {
        console.log('computing `picks`')
        return this.leagueUserPicksForThisWeek() || {}
      },
      numLeagueUsers () {
        return Object.keys(this.league.users || {}).length
      },
      standings () {
        var leagueUsers = this.league.users
        console.warn('STANDINGS :: this.game', this.games)
        return Object.keys(leagueUsers || {}).map(userId => {
          var leagueUserPicksForThisWeek = this.leagueUserPicksForThisWeek(userId)
          return {
            displayName: leagueUsers[userId].displayName,
            points: Object.keys(leagueUserPicksForThisWeek || {}).reduce((points, gameId) => {
              var game = this.games.find(game => { return '' + game.gameId === '' + gameId })
              // console.log('userId', userId, 'gameId', gameId, 'game', game)
              return points + (
                game && game.phase === 'FINAL' &&
                leagueUserPicksForThisWeek[gameId] === '' + Number(game.homeTeam.score > game.visitorTeam.score)
                  ? 1
                  : 0
              )
            }, 0),
          }
        }).sort((userA, userB) => {
          return userB.points > userA.points ? 1 : -1
        })
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
        this.isLoading = this.games.length === 0
        this.$forceUpdate()
      },
      week (val) {
        console.log('on week updated', val)
      },
      games (val) {
        console.log('on games updated', val)
        this.isLoading = !this.league.owner
        this.$forceUpdate()
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

    table
      margin: 0 auto

    td
      padding: 10px
      text-align: right
      + td
        text-align: left

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
