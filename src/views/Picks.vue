<template>
  <div class="wrapper">
    <h1>Picks</h1>
    <ul v-if="games && games.length">
      <li v-for="(game, gameIndex) in games">
        <team-card
          :team="game.gameSchedule.visitorTeam"
          :isPicked="picks[gameIndex] === 0"
          :isGameHasPick="gameIndex in picks"
          @pick="toggleTeamPick(gameIndex, 0)"
        />
        <tristate-toggle
          :value="picks[gameIndex]"
          :gameIndex="gameIndex"
          :isLoading="isLoading"
          @change="toggleTeamPick"
        />
        <team-card
          :team="game.gameSchedule.homeTeam"
          :isPicked="picks[gameIndex] === 1"
          :isGameHasPick="gameIndex in picks"
          @pick="toggleTeamPick(gameIndex, 1)"
        />
      </li>
    </ul>
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
      }
    },
    watch: {
      user (val) {
        if (val) {
          firebase.database()
            .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/week/' + this.week + '/game/')
            .once('value').then(snapshot => {
              console.log('watch user - snapshot', snapshot.val())
              this.picks = snapshot.val()
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
        // fetch('https://feeds.nfl.com/feeds-rs/schedules.json')
        //   .then(res => {
        //     return res.json()
        //   }).then(json => {
        //     // todo: update the data structure to store BY WEEK
        //     var schedule = json.gameSchedules.filter(item => {
        //       return item.seasonType !== 'PRE'
        //     })
        //     console.log('schedule', schedule)
        //     firebase.database()
        //       .ref('schedules/season/' + json.season + '/REG')
        //       .set(schedule)
        //   })

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
        // todo: get the user's picks
      },
      toggleTeamPick (gameIndex, teamIndex) {
        if (!this.user) return
        this.isLoading = true
        this.picks[gameIndex] = teamIndex
        console.log('toggleTeamPick', gameIndex, teamIndex)
        // todo: store the pick
        // todo: make the season (2017) dynamic
        firebase.database()
          .ref('picks/user/' + this.user.uid + '/season/' + this.season + '/week/' + this.week + '/game/' + gameIndex)
          .set(teamIndex)
          .then(() => {
            this.isLoading = false
          })
      },
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .wrapper {
    text-align: center;
    padding: 20px;
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
