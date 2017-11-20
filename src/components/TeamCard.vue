<template>
  <div class="team" @click="pick">
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
