<template>
  <mu-appbar id="my-header">
    <!--<mu-icon-button icon="menu" slot="left"/>-->
    <router-link to="/" class="site-logo">
      <!--<img class="site-logo__image" src="../assets/crown-simple.svg"/>-->
      <img class="site-logo__image" src="../assets/football.svg"/>
    </router-link>

    <mu-flat-button
      label="Picks"
      slot="right"
      to="picks"
    />
    <mu-raised-button
      v-show="!user"
      label="Log In"
      secondary
      slot="right"
      to="/login"
    />
    <mu-flat-button
      v-show="user"
      :label="user && user.displayName"
      labelPosition="before"
      slot="right"
      ref="userButton"
      @click="toggle"
    >
      <mu-avatar :src="user && user.photoURL" />
    </mu-flat-button>
    <mu-popover
      slot="right"
      :trigger="userMenuTrigger"
      :open="userMenuOpen"
      @close="handleClose"
      :anchorOrigin="{vertical: 'bottom', horizontal: 'right'}"
      :targetOrigin="{vertical: 'top', horizontal: 'right'}"
    >
      <mu-menu>
        <mu-menu-item title="Profile" to="/profile" @click.native="handleClose" />
        <mu-menu-item title="Logout" to="/logout" @click.native="handleClose" />
      </mu-menu>
    </mu-popover>

  </mu-appbar>
</template>
<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    userMenuOpen: false,
    userMenuTrigger: null,
  }),
  computed: {
    ...mapState({
      user: 'user',
    }),
  },
  watch: {
    user (val) {
      if (val) {
        this.userMenuTrigger = this.$refs.userButton.$el
      }
    },
  },
  methods: {
    toggle () {
      this.userMenuOpen = !this.userMenuOpen
    },
    handleClose (e) {
      this.userMenuOpen = false
    },
  },
}
</script>
<style lang="sass">
#my-header
  .site-logo
    float: left
    .site-logo__image
      display: block
      width: 35px
      height: 35px
</style>
