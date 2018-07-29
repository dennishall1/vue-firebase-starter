<template>
  <div id="my-footer">

    <router-link to="/privacy-policy">
      Privacy Policy
    </router-link>

    <span>
      Copyright {{ (new Date()).getFullYear() }}
    </span>

  </div>
</template>
<style lang="sass">
  #my-footer
    background: rgba(0, 0, 0, .1)
    text-align: center
    padding: 20px
    color: #888
    font-size: 14px
    margin-top: 50px
    a
      color: inherit
      display: inline-block
      margin: 10px
    span
      display: inline-block
      margin: 10px
</style>
