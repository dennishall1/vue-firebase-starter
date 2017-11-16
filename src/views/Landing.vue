<template>
  <div class="wrapper">
    <h1>Schedule</h1>
    <ul v-if="games && games.length">
      <li v-for="game in games" v-if="game.team1">
        <div class="team">
          <h3>
            {{ game.team1 }}
          </h3>
          <img :src="game.team1_logo.slice(4, -1)"/>
        </div>
        <div>
          <label class="mu-switch demo-switch">
            <input type="checkbox">
            <div class="mu-switch-wrapper">
              <div class="mu-switch-container">
                <div class="mu-switch-track"></div>
                <div class="mu-switch-thumb">
                  <div class="mu-ripple-wrapper mu-switch-ripple-wrapper"></div>
                </div>
              </div>
              <div class="mu-switch-label"></div>
            </div>
          </label>
        </div>
        <div class="team">
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
import 'whatwg-fetch'
export default {
  name: 'hello',
  data () {
    return {
      games: [],
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      fetch('https://api.apify.com/v1/rs7ntQdHsu4L2g8iA/crawlers/5cCo62Xs7omPRqtNR/lastExec/results?token=icrF4BDXjBePhFcqHFmtd9rf9&format=json&status=SUCCEEDED')
        .then(response => {
          return response.json()
        }).then(json => {
          this.games = JSON.parse(JSON.stringify(json[0].pageFunctionResult))
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
  width: 200px;
  height: 136px;
}

.mu-switch {
  margin: 50px 50px 0;
  transform: scale(2, 2);
}

a {
  color: #42b983;
}
</style>
