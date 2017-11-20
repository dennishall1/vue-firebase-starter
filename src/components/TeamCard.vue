<template>
  <div
    @click="pick"
    :class="{
      'picked': isPicked,
      'game-has-pick': isGameHasPick,
    }"
  >
    <h3>
      <span class="eyebrow">
        {{ team.cityState.replace(team.nick, '') }}
      </span>
      <span class="h3-content">
        {{ team.nick }}
      </span>
    </h3>
    <img :src="'http://i.nflcdn.com/static/site/7.5/img/logos/svg/teams-matte-mascot/' + team.nick.toLowerCase() + '.svg'"/>
  </div>
</template>

<script>
export default {
  name: 'team-card',
  props: {
    team: {
      type: Object,
    },
    isPicked: Boolean,
    isGameHasPick: Boolean,
  },
  methods: {
    pick () {
      this.$emit('pick')
    },
  },
}
</script>

<style scoped>

  h3 {
    color: white;
    font-size: 200%;
    transition: all .2s;
    margin: 0 0 10px;
  }
  .picked .h3-content {
    color: #00adea;
    text-shadow: 0 0 20px #999;
  }

  .eyebrow {
    display: block;
    font: 50% wide, sans-serif;
    opacity: .7;
  }

  img {
    width: 100%;
  }

  @media (min-width:500px) {
    img {
      width: 200px;
      height: 136px;
    }
  }
</style>
