<template>
  <div class="wrapper">
    <h1>Standings</h1>
    <ul v-if="games && games.length">
      <li v-for="(game, gameIndex) in games">
        <team-card
          stay-alive
          :team="game.gameSchedule.visitorTeam"
          :isPicked="picks[gameIndex] === 0"
        />
        <span style="display: inline-block; width: 30px;">&nbsp;</span>
        <team-card
          stay-alive
          :team="game.gameSchedule.homeTeam"
          :isPicked="picks[gameIndex] === 1"
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
        leagueUserPicks: {},
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

            console.log('parsed json', this.games)
          }).catch(ex => {
            console.log('parsing failed', ex)
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
