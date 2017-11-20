<template>
  <div class="tristate-toggle-wrapper">
    <div
      :class="{
        'tristate-toggle': true,
        'left': value === 0,
        'right': value === 1,
        'loading': isLoading === true
      }"
    >
      <img
        src="../assets/siteSprite.png"
        :class="{
          'tristate-toggle__thumb': true,
          'left': value === 0,
          'right': value === 1
        }"
      />
      <b class="tristate-toggle__button" @click="change(0)"></b>
      <b class="tristate-toggle__button" @click="change(1)"></b>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'tristate-toggle',
    props: {
      value: Number,
      gameIndex: Number,
      isLoading: Boolean,
    },
    methods: {
      change (value) {
        this.$emit('change', this.gameIndex, value)
      },
    },
  }
</script>

<style lang="sass">
  .tristate-toggle-wrapper
    margin: 0 10px
    border-radius: 15px
    box-shadow: 0 0 25px #000
  .tristate-toggle
    position: relative
    width: 75px
    height: 30px
    overflow: hidden
    margin: 0 15px
    tranistion: margin .3s
    -webkit-transition: margin .3s
    &.left
      margin: 0 30px 0 0
    &.right
      margin: 0 0 0 30px
    &__thumb
      position: absolute
      top: -310px
      left: -205px
      &.left
        top: -350px
      &.right
        top: -390px
    &__button
      width: 50%
      height: 100%
      float: left
      position: relative
      z-index: 3
</style>
