<template>
  <div class="team-card-wrapper">
    <div
      @click="pick"
      :class="{
        'team-card': true,
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
      <img
        class="team-card__image"
        :src="'http://i.nflcdn.com/static/site/7.5/img/logos/svg/teams-matte-mascot/' + team.nick.toLowerCase() + '.svg'"
      />
    </div>
    <div
      v-if="usersWhoPickedThisTeam"
      v-for="user in usersWhoPickedThisTeam"
      :class="{
          'team-card__picked-by-user': true,
          'team-card__picked-by-user--current-user': user.isCurrentUser,
        }"
    >
      {{ user.displayName.split(' ')[0] }}
    </div>
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
    usersWhoPickedThisTeam: Array,
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
  .team-card__picked-by-user {
    display: inline-block;
    margin: 5px;
    opacity: .7;
    text-transform: none;
  }
  .team-card__picked-by-user--current-user {
    opacity: 1;
  }
  @media (max-width: 600px) {
    h3 {
      font-size: 20px;
    }
    .team-card__picked-by-user {
      font-size: 14px;
      margin: 5px 3px 0;
    }
  }
</style>
