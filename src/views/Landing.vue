<template>
  <div class="wrapper">
    <h1>Schedule</h1>
    <ul v-if="games && games.length">
      <li v-for="game in games" v-if="game.team1">
        <div class="team" @click="toggleTeamPick(0)">
          <h3>
            {{ game.team1 }}
          </h3>
          <img :src="game.team1_logo.slice(4, -1)"/>
        </div>
        <mu-switch
          value=""
          @input="toggleTeamPick"
        />
        <div class="team" @click="toggleTeamPick(1)">
          <h3>
            {{ game.team2 }}
          </h3>
          <img :src="game.team2_logo.slice(4, -1)"/>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import firebase from 'firebase'
import 'whatwg-fetch'
export default {
  name: 'hello',
  data () {
    return {
      games: [],
      picks: [],
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      // get the games
      fetch('https://api.apify.com/v1/rs7ntQdHsu4L2g8iA/crawlers/5cCo62Xs7omPRqtNR/lastExec/results?token=icrF4BDXjBePhFcqHFmtd9rf9&format=json&status=SUCCEEDED')
        .then(response => {
          return response.json()
        }).then(json => {
          this.games = JSON.parse(JSON.stringify(json[0].pageFunctionResult))
          console.log('parsed json', this.games)
        }).catch(ex => {
          console.log('parsing failed', ex)
        })
      // todo: get the user's picks
    },
    toggleTeamPick (teamIndex) {
      var database = firebase.database()
      // todo: store the pick
      database.ref('picks/')
      console.log('toggleTeamPick', teamIndex)
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

li img {
  width: 100%;
}

@media (min-width:500px) {
  li img {
    width: 200px;
    height: 136px;
  }
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
