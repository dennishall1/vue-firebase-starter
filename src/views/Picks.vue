<template>
  <div class="wrapper">

    <h1>Picks</h1>

    <ul v-if="games && games.length">
      <li v-for="(game, gameIndex) in games">
        <team-card
          stay-alive
          :team="game.gameSchedule.visitorTeam"
          :isPicked="picks[gameIndex] === 0"
          :isGameHasPick="gameIndex in picks"
          @pick="toggleTeamPick(gameIndex, 0)"
        ></team-card>
        <tristate-toggle
          stay-alive
          :value="picks[gameIndex]"
          :gameIndex="gameIndex"
          :isLoading="isLoading"
          @change="toggleTeamPick"
        ></tristate-toggle>
        <team-card
          stay-alive
          :team="game.gameSchedule.homeTeam"
          :isPicked="picks[gameIndex] === 1"
          :isGameHasPick="gameIndex in picks"
          @pick="toggleTeamPick(gameIndex, 1)"
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
        label="Yes - Lock in My Picks"
        @click="lockPicks"
      ></mu-raised-button>
    </mu-dialog>

    <mu-raised-button
      label="Lock Picks"
      :disabled="Object.keys(picks).length !== games.length"
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
            .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/' + this.seasonType + '/week/' + this.week + '/game/')
            .once('value').then(snapshot => {
              console.log('watch user - snapshot', snapshot.val())
              this.picks = snapshot.val() || this.picks
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
        if (!this.user || this.isLoading) return
        this.isLoading = true
        this.picks[gameIndex] = teamIndex
        console.log('toggleTeamPick', gameIndex, teamIndex)
        firebase.database()
          .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/' + this.seasonType + '/week/' + this.week + '/game/' + gameIndex)
          .set(teamIndex)
          .then(() => {
            this.isLoading = false
          })
      },
      showLockPicksModal () {
        this.shouldShowLockPicksDialog = true
      },
      lockPicks () {
        if (!this.user || this.isLoading) return
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .wrapper {
    text-align: center;
    padding: 20px 20px 90px;
  }
  h1 {
    font-family: bold-cond;
    font-size: 50px;
  }
  h1, h2 {
    font-weight: normal;
    color: white
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: flex;
    margin: 0 0 40px;
    justify-content: center;
    align-items: center;
  }

  .mu-switch {
    margin: 50px 50px 0;
    transform: scale(1.5);
  }
  .team {
    cursor: pointer;
  }
  a {
    color: #42b983;
  }
</style>
