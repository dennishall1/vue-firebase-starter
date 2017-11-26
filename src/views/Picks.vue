<template stay-alive>
  <div class="wrapper picks">

    <h1>Picks</h1>

    <p v-if="isPicksLocked">
      Your picks are locked in for this week.<br/><br/>
    </p>

    <ul v-if="games && games.length">
      <li v-for="(game, gameIndex) in games">
        <team-card
          stay-alive
          :team="game.gameSchedule.visitorTeam"
          :isPicked="picks[game.gameSchedule.gameId] === '0'"
          :isGameHasPick="game.gameSchedule.gameId in picks"
          @pick="toggleTeamPick(game.gameSchedule.gameId, '0')"
        ></team-card>
        <mu-radio
          v-model="picks[game.gameSchedule.gameId]"
          nativeValue="0">
        </mu-radio>
        <tristate-toggle
          stay-alive
          :value="Number(picks[game.gameSchedule.gameId])"
          :gameId="game.gameSchedule.gameId"
          :isLoading="isLoading"
          @change="toggleTeamPick"
        ></tristate-toggle>
        <mu-radio
          v-model="picks[game.gameSchedule.gameId]"
          nativeValue="1">
        </mu-radio>
        <team-card
          stay-alive
          :team="game.gameSchedule.homeTeam"
          :isPicked="picks[game.gameSchedule.gameId] === '1'"
          :isGameHasPick="game.gameSchedule.gameId in picks"
          @pick="toggleTeamPick(game.gameSchedule.gameId, '1')"
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
      v-if="!isPicksLocked"
      @click="showLockPicksModal"
    ></mu-raised-button>

  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import firebase from 'firebase'
  // import 'whatwg-fetch'
  import fetch from 'unfetch'
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
      }),
    },
    data () {
      return {
        isPicksLocked: false,
        isLoading: true,
        season: null,
        seasonType: null,
        week: null,
        games: [],
        leagueId: '-KzPdROlkcWZDUsd47av',
        shouldShowLockPicksDialog: false,
      }
    },
    watch: {
      user () {
        console.log('watch user :: week, user', this.week, this.user)
        this.setPicksRef()
      },
    },
    mounted () {
      this.getData()
    },
    methods: {
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
      getData () {
        // get the games
        // https://feeds.nfl.com/feeds-rs/scores.json
        // https://feeds.nfl.com/feeds-rs/schedules.json
        // https://api.apify.com/v1/rs7ntQdHsu4L2g8iA/crawlers/5cCo62Xs7omPRqtNR/lastExec/results?token=icrF4BDXjBePhFcqHFmtd9rf9&format=json&status=SUCCEEDED
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

            console.log('getData :: week, user', this.week, this.user)
            this.setPicksRef()

            console.log('parsed json', this.games)
          }).catch(ex => {
            console.log('parsing failed', ex)
          })
      },
      toggleTeamPick (gameId, teamIndex) {
        if (this.picks.isLocked || !this.user || this.isLoading) return
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
        this.isPicksLocked = true
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
