<template>
  <div class="wrapper picks">

    <h1>
      Picks for Week
      <mu-select-field v-model="week" @change="setWeek">
        <mu-menu-item
          v-for="_week in weeks"
          :key="_week"
          :value="_week"
          :title="_week"
        ></mu-menu-item>
      </mu-select-field>
    </h1>

    <div v-if="shouldShowTotalYardsInput">
      <p style="text-transform: none">
        You have the same picks as
        <span v-for="displayName in usersWithSamePicks">{{ displayName }}</span>.
        You must enter your Total Net Yards for the
        {{
          sortedGames[sortedGames.length - 1].visitorTeam.nick + '@' +
          sortedGames[sortedGames.length - 1].homeTeam.nick
        }}
        game.
      </p>
      <mu-text-field
        id="totalYardsInput"
        label="Total Net Yards"
        v-model="totalYards"
        :disabled="picks.isTotalYardsLocked"
        type="number"
        min="0"
        required
        pattern="[1-9][0-9]*"
      ></mu-text-field>
      <mu-raised-button
        label="Lock In Total Yards"
        :disabled="Object.keys(picks).length < games.length"
        v-if="!picks.isTotalYardsLocked"
        @click="shouldShowLockTotalYardsDialog = true"
      ></mu-raised-button>
      <br><br><br>
    </div>

    <p
      v-if="picks.isLocked"
      class="picks__is-locked-message"
    >
      Your picks are locked in for this week.
    </p>

    <ul v-if="games && games.length">
      <template
        v-for="(game, gameIndex) in sortedGames"
      >
        <li
          :class="{
            'date-header': 1,
            'is-same-day': gameIndex && game.gameDate === sortedGames[gameIndex - 1].gameDate
          }"
          v-if="gameIndex === 0 || game.isoTime !== sortedGames[gameIndex - 1].isoTime"
          v-html="getDateDisplayForGame(game)"
        ></li>
        <li :key="game.gameId" :data-id="game.gameId" :class="{'disabled': picks.isLocked}">
          <team-card
            :team="game.visitorTeam"
            :isPicked="picks[game.gameId] === '0'"
            :isGameHasPick="game.gameId in picks"
            @pick="toggleTeamPick(game.gameId, '0')"
          ></team-card>
          <mu-radio
            v-model="picks[game.gameId]"
            nativeValue="0"
            :disabled="picks.isLocked"
          ></mu-radio>
          <tristate-toggle
            :value="Number(picks[game.gameId])"
            :gameId="game.gameId"
            :isLoading="isLoading"
            :disabled="picks.isLocked"
            @change="toggleTeamPick"
          ></tristate-toggle>
          <mu-radio
            v-model="picks[game.gameId]"
            nativeValue="1"
            :disabled="picks.isLocked"
          ></mu-radio>
          <team-card
            :team="game.homeTeam"
            :isPicked="picks[game.gameId] === '1'"
            :isGameHasPick="game.gameId in picks"
            @pick="toggleTeamPick(game.gameId, '1')"
          ></team-card>
        </li>
      </template>
      <li v-if="picks.isTotalYardsLocked">
        Tie-breaker: {{ totalYards }} Total Yards
      </li>
    </ul>

    <mu-dialog
      :open="shouldShowLockTotalYardsDialog"
    >
      <h3>Are you sure you want to lock in your total yards?</h3>
      <mu-raised-button
        label="No"
        @click="shouldShowLockTotalYardsDialog = false"
      ></mu-raised-button>
      <mu-raised-button
        label="Yes"
        @click="lockTotalYards"
      ></mu-raised-button>
    </mu-dialog>

    <mu-dialog
      :open="shouldShowLockPicksDialog"
    >
      <h3>Are you sure you want to lock in your picks?</h3>
      <mu-raised-button
        label="No"
        @click="shouldShowLockPicksDialog = false"
      ></mu-raised-button>
      <mu-raised-button
        label="Yes"
        @click="lockPicks"
      ></mu-raised-button>
    </mu-dialog>

    <mu-raised-button
      label="Lock Picks"
      :disabled="Object.keys(picks).length < games.length"
      v-if="!picks.isLocked"
      @click="shouldShowLockPicksDialog = true"
    ></mu-raised-button>

  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import TeamCard from '@/components/TeamCard'
  import TristateToggle from '@/components/TristateToggle'
  import mixins from '@/mixins'
  import { season, seasonType, week, weeks } from '@/util/season'
  // import 'whatwg-fetch'

  console.log('mixins', mixins)

  export default {
    name: 'Picks',
    mixins: [mixins],
    components: {
      TristateToggle,
      TeamCard,
    },
    computed: {
      ...mapState({
        user: 'user',
        league: 'league',
        picks: 'picks',
        games: 'games',
      }),
      shouldShowTotalYardsInput () {
        var shouldShowTotalYardsInput = !this.picks.isTotalYardsLocked && (this.usersWithSamePicks || []).length > 0
        if (shouldShowTotalYardsInput) {
          // "autofocus"
          setTimeout(() => {
            document.querySelector('input[type="number"]').focus()
          }, 200)
        }
        return shouldShowTotalYardsInput
      },
      usersWithSamePicks () {
        var leagueUsers = this.league.users || {}
        return leagueUsers && this.picks.isLocked && Object.keys(leagueUsers).filter(leagueUserId => {
          var leagueUserPicksForThisWeek = this.leagueUserPicksForThisWeek(leagueUserId)
          return this.user.uid !== leagueUserId && leagueUserPicksForThisWeek && !Object.keys(this.picks).some(prop => {
            return prop.match(/\.key|totalYards|isTotalYardsLocked/)
              ? false
              : this.picks[prop] !== leagueUserPicksForThisWeek[prop]
          })
        }).map(leagueUserId => {
          return leagueUsers[leagueUserId].displayName
        })
      },
      sortedGames () {
        // javascript `sort` operates in-place
        this.games.sort((game1, game2) => {
          return game1.isoTime !== game2.isoTime
            ? (game1.isoTime < game2.isoTime ? -1 : 1)
            : (game1.gameId < game2.gameId ? -1 : 1)
        })

        // enforce a time cut-off.
        var currentTime = Date.now()
        var firstGameTime = +(new Date([
          this.games[0].formattedDate,
          (new Date()).getFullYear(),
          this.games[0].formattedTime,
          'EST',
        ].join(' ')))
        var hoursUntilFirstGame = (firstGameTime - currentTime) / 1000 / 60 / 60
        var date = new Date()
        var secondSundayInMarch = new Date(date.getFullYear() + '/03/01 02:30 EDT')
        while (secondSundayInMarch.getDay() !== 0) {
          secondSundayInMarch = new Date(secondSundayInMarch.getTime() + (24 * 60 * 60 * 1000))
        }
        var firstSundayInNovember = new Date(date.getFullYear() + '/11/01 02:30 EDT')
        while (firstSundayInNovember.getDay() !== 0) {
          firstSundayInNovember = new Date(firstSundayInNovember.getTime() + (24 * 60 * 60 * 1000))
        }
        var isEST = date.getTime() < secondSundayInMarch.getTime() || date.getTime() > firstSundayInNovember.getTime()
        var noonEST = new Date(date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' 12:00 ' + (isEST ? 'EST' : 'EDT'))
        var hoursUntilNoonEST = (+noonEST - currentTime) / 1000 / 60 / 60
        console.log('hoursUntilFirstGame', hoursUntilFirstGame, 'hoursUntilNoonEST', hoursUntilNoonEST)
        if (hoursUntilFirstGame < 0.1 || (hoursUntilFirstGame < 14 && hoursUntilNoonEST < 0)) {
          // user is not allowed to pick teams for this week.
          this.picks.isLocked = true
        }

        return this.games
      },
    },
    data () {
      return {
        isLoading: true,
        season: '' + season,
        seasonType: seasonType,
        week: '' + week,
        weeks: weeks,
        leagueId: '-KzPdROlkcWZDUsd47av',
        shouldShowLockPicksDialog: false,
        shouldShowLockTotalYardsDialog: false,
        totalYards: null,
      }
    },
    watch: {
      user () {
        console.log('watch user :: week, user', this.week, this.user, this.user.uid)
        this.setPicksRef()
        this.setLeagueRef()
      },
      games (val) {
        console.log('watched games changed', val)
        this.isLoading = Object.keys(this.picks).length === 0 || !this.league.users
      },
      picks (val) {
        console.log('watched picks changed', val)
        if (this.picks.isTotalYardsLocked) {
          this.totalYards = this.picks.totalYards
        }
        this.isLoading = !this.league.users
      },
      league (val) {
        console.log('watched league changed', val)
        this.isLoading = Object.keys(this.picks).length === 0
      },
    },
    mounted () {
      // console.log('mounted', 'games', this.games, 'picks', this.picks)
      this.setWeek()
    },
    methods: {
      // onlyAllowNumbers (event) {
      //   if (!/\d/.match(String.fromCharCode(event.which || event.keyCode))) {
      //     event.preventDefault()
      //   }
      // },
    },
  }
</script>

<style lang="sass">
  .picks
    text-align: center
    padding: 20px 20px 90px

    h1
      font-family: bold-cond, sans-serif
      font-size: 50px

    h1, h2
      font-weight: normal
      color: white

    &__is-locked-message
      display: inline-block
      padding: 20px 50px
      margin: 0 auto 30px
      color: #00adea
      border: 1px solid #00adea
      animation: pulse 2s linear infinite
      -webkit-animation: pulse 2s linear infinite
      -moz-animation: pulse 2s linear infinite

    ul
      list-style-type: none
      padding: 0
      display: table
      margin: 0 auto

    li
      display: flex
      margin: 0 0 40px
      justify-content: center
      align-items: center

    .date-header
      display: block
      margin: 0 0 20px
      &__day
        display: block
        margin: 0 0 30px
        padding: 10px 0
        border-bottom: 1px solid #aaa
      &.is-same-day
        .date-header__day
          display: none

    .team-card
      width: 315px
      cursor: pointer
      display: flex
      align-items: flex-start
      flex-direction: row-reverse
      justify-content: space-between
      text-align: right
      &__image
        width: 100px
        height: auto
    .team-card-wrapper ~ .team-card-wrapper
      .team-card
        flex-direction: row
        text-align: left
    .disabled
      .team-card
        cursor: default

    .mu-radio
      display: none!important

    h1
      .mu-text-field
        width: 80px
      .mu-select-field
        .mu-dropDown-menu
          height: auto
          font-size: 50px
        .mu-dropDown-menu-text
          color: #00adea
          height: 37px
          line-height: 37px
        .mu-dropDown-menu-icon
          color: #00adea
        .mu-text-field-line
          background: #aaa

    .mu-text-field.has-label
      width: 140px
      color: white
      .mu-text-field-label.float
        color: rgba(255,255,255,.5)
      .mu-text-field-input
        color: white
      .mu-text-field-line
        background: white

    @keyframes pulse
      0%
        opacity: .4
      50%
        opacity: 1
      100%
        opacity: .4

    @media (max-width: 600px)
      h1
        font-size: 40px
      h3
        text-align: center

      li
        align-items: flex-start

      .team-card
        width: auto
        display: block
        &.game-has-pick:not(.picked)
          opacity: .7
        &__image
          width: 100px
          height: auto

      .mu-radio
        display: inline-block!important
        margin: 5px
        &.disabled
          .mu-radio-icon-checked
            color: #00adea

      .tristate-toggle-wrapper
        display: none

</style>
