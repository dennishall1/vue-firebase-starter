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
          :isPicked="picks[gameIndex] === '0'"
          :isGameHasPick="gameIndex in picks"
          @pick="toggleTeamPick(gameIndex, '0')"
        ></team-card>
        <mu-radio
          v-model="picks[gameIndex]"
          nativeValue="0">
        </mu-radio>
        <tristate-toggle
          stay-alive
          :value="Number(picks[gameIndex])"
          :gameIndex="gameIndex"
          :isLoading="isLoading"
          @change="toggleTeamPick"
        ></tristate-toggle>
        <mu-radio
          v-model="picks[gameIndex]"
          nativeValue="1">
        </mu-radio>
        <team-card
          stay-alive
          :team="game.gameSchedule.homeTeam"
          :isPicked="picks[gameIndex] === '1'"
          :isGameHasPick="gameIndex in picks"
          @pick="toggleTeamPick(gameIndex, '1')"
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
      :disabled="Object.keys(picks).length !== games.length"
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
        picks: {},
        shouldShowLockPicksDialog: false,
      }
    },
    watch: {
      user (val) {
        if (val) {
          firebase.database()
            .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/' + this.seasonType + '/week/' + this.week)
            .once('value').then(snapshot => {
              var val = snapshot.val()
              console.log('watch user - snapshot', val)
              if (!val) return // it's a new week, or the user has not picked anything yet
              this.isPicksLocked = val['is-locked']
              this.picks = val.game || this.picks
              this.picks.forEach((game, gameIndex) => {
                this.picks[gameIndex] = this.picks[gameIndex].toString()
              })
            })
        }
      },
    },
    mounted () {
      this.getData()
    },
    methods: {
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

            console.log('parsed json', this.games)
          }).catch(ex => {
            console.log('parsing failed', ex)
          })
      },
      toggleTeamPick (gameIndex, teamIndex) {
        if (this.isPicksLocked || !this.user || this.isLoading) return
        this.isLoading = true
        this.picks[gameIndex] = teamIndex
        console.log('toggleTeamPick', gameIndex, teamIndex)
        firebase.database()
          .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/' + this.seasonType + '/week/' + this.week + '/is-locked')
          .once('value').then(snapshot => {
            var val = snapshot.val()
            console.log('watch user - snapshot', val)
            if (!val) return // it's a new week, or the user has not picked anything yet
            this.isPicksLocked = val['is-locked']
            if (this.isPicksLocked) return
            firebase.database()
              .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/' + this.seasonType + '/week/' + this.week + '/game/' + gameIndex)
              .set(teamIndex)
              .then(() => {
                this.isLoading = false
              })
          })
      },
      showLockPicksModal () {
        this.shouldShowLockPicksDialog = true
      },
      lockPicks () {
        if (!this.user || this.isLoading) return
        this.isPicksLocked = true
        window.scrollTo(0, 0)
        firebase.database()
          .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/' + this.seasonType + '/week/' + this.week + '/is-locked')
          .set(true)
          .then(() => {
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
