<template>
<div class="profile-page">
  <h1>My Profile</h1>
  <hr />

  <img :src="user.photoURL" />
  <h3>{{ (user.displayName || 'Anonymous') }}</h3>
  <p>email: {{ user.email }}</p>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['user']),
  },
}
</script>

<style lang="scss">
.profile-page {
  padding: 8%;
  img {
    max-width: 100%;
  }
}
</style>
