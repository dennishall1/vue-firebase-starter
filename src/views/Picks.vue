<template>
  <div class="wrapper picks">

    <h1>
      Picks for Week
      <mu-select-field v-model="week" @change="setWeek">
        <mu-menu-item
          v-for="_week in weeks"
          :key="_week"
          :value="_week"
          :title="_week"
        ></mu-menu-item>
      </mu-select-field>
    </h1>

    <p v-if="picks.isLocked">
      Your picks are locked in for this week.<br/><br/>
    </p>

    <ul v-if="games && games.length">
      <li v-for="game in games" :key="game.gameId">
        <team-card
          :team="game.visitorTeam"
          :isPicked="picks[game.gameId] === '0'"
          :isGameHasPick="game.gameId in picks"
          @pick="toggleTeamPick(game.gameId, '0')"
        ></team-card>
        <mu-radio
          v-model="picks[game.gameId]"
          nativeValue="0"
        ></mu-radio>
        <tristate-toggle
          :value="Number(picks[game.gameId])"
          :gameId="game.gameId"
          :isLoading="isLoading"
          @change="toggleTeamPick"
        ></tristate-toggle>
        <mu-radio
          v-model="picks[game.gameId]"
          nativeValue="1"
        ></mu-radio>
        <team-card
          :team="game.homeTeam"
          :isPicked="picks[game.gameId] === '1'"
          :isGameHasPick="game.gameId in picks"
          @pick="toggleTeamPick(game.gameId, '1')"
        ></team-card>
      </li>
    </ul>

    <mu-dialog
      :open="shouldShowLockPicksDialog"
    >
      <h3>Are you sure you want to lock in your picks?</h3>
      <mu-raised-button
        label="No"
        @click="shouldShowLockPicksDialog = false"
      ></mu-raised-button>
      &nbsp;
      <mu-raised-button
        label="Yes"
        @click="lockPicks"
      ></mu-raised-button>
    </mu-dialog>

    <mu-raised-button
      label="Lock Picks"
      :disabled="Object.keys(picks).length < games.length"
      v-if="!picks.isLocked"
      @click="showLockPicksModal"
    ></mu-raised-button>

  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import firebase from 'firebase'
  // import 'whatwg-fetch'
  import TeamCard from '@/components/TeamCard'
  import TristateToggle from '@/components/TristateToggle'

  export default {
    name: 'Picks',
    components: {
      TristateToggle,
      TeamCard,
    },
    computed: {
      ...mapState({
        user: 'user',
        league: 'league',
        picks: 'picks',
        games: 'games',
      }),
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

      // `[...Array(N).keys()]` .. someday
      for (var i = minWeek; i <= maxWeek; i++) {
        weeks.push('' + i)
      }

      return {
        isLoading: true,
        season: '' + season,
        seasonType: seasonType,
        week: '' + week,
        weeks: weeks,
        leagueId: '-KzPdROlkcWZDUsd47av',
        shouldShowLockPicksDialog: false,
      }
    },
    watch: {
      user () {
        console.log('watch user :: week, user', this.week, this.user, this.user.uid)
        this.setPicksRef()
      },
      games (val) {
        console.log('watched games changed', val)
        this.isLoading = Object.keys(this.picks).length === 0
      },
      picks (val) {
        console.log('watched picks changed', val)
        this.isLoading = this.games.length === 0
      },
    },
    mounted () {
      console.log('mounted', 'games', JSON.stringify(this.games), 'picks', JSON.stringify(this.picks))
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
        if (week || week === 0) {
          this.week = '' + week
        }
        this.setPicksRef()
      },
      getPicksRef () {
        return firebase.database().ref(
          '/leagues/' + this.leagueId +
          '/users/' + this.user.uid +
          '/season/' + this.season +
          '/' + this.seasonType +
          '/week/' + this.week
        )
      },
      setPicksRef () {
        if (this.user && this.week) {
          this.$store.dispatch('setPicksRef', this.getPicksRef())
        }
      },
      toggleTeamPick (gameId, teamIndex) {
        if (this.picks.isLocked || !this.user || this.isLoading) {
          return
        }
        this.isLoading = true
//        this.picks['' + gameId] = teamIndex
        console.log('toggleTeamPick', gameId, teamIndex)
        this.getPicksRef().child('' + gameId).set('' + teamIndex).then(() => {
          this.isLoading = false
        })
      },
      showLockPicksModal () {
        this.shouldShowLockPicksDialog = true
      },
      lockPicks () {
        if (!this.user || this.isLoading) return
        window.scrollTo(0, 0)
        this.getPicksRef().child('isLocked').set(true).then(() => {
          this.isLoading = false
          this.shouldShowLockPicksDialog = false
        })
      },
    },
  }
</script>

<style lang="sass">
  .picks
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

    li
      display: flex
      margin: 0 0 40px
      justify-content: center
      align-items: center

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
    .team-card-wrapper ~ .team-card-wrapper
      .team-card
        flex-direction: row
        text-align: left

    .mu-radio
      display: none!important

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

      .mu-radio
        display: inline-block!important
        margin: 5px

      .tristate-toggle-wrapper
        display: none

</style>
