<template>
  <div id="app">
    <my-header />
    <router-view />
    <my-footer />
  </div>
</template>

<script>
  import MyHeader from '@/components/MyHeader'
  import MyFooter from '@/components/MyFooter'

  export default {
    name: 'app',
    components: {
      MyHeader,
      MyFooter,
    },
  }
</script>

<style lang="sass">
  @font-face
    font-family: "wide"
    src: url("assets/fonts/bold.woff") format("woff")
  @font-face
    font-family: "bold-cond"
    src: url("assets/fonts/bold-cond.woff") format("woff")
  @font-face
    font-family: "medium-cond"
    src: url("assets/fonts/medium-cond.woff") format("woff")

  body
    background: #444!important

  #app
    background: #444
    font: 150%/1 medium-cond, Helvetica, Arial
    text-transform: uppercase
    letter-spacing: .05em
    color: white

</style>
