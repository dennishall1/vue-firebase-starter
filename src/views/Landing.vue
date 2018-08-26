<template>
  <div class="wrapper landing">
    <h1>
      Week
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
        <span>
          <span v-for="displayName in usersWithSamePicks">{{ displayName }}</span>
        </span>.
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

    <mu-switch
      v-model="shouldCollapseIrrelevantGames"
      label="Show relevant games only"
    ></mu-switch>
    <br><br>

    <ul
      v-if="picks.isLocked"
      :class="{blur: shouldShowTotalYardsInput}"
    >
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
        <li
          :data-id="game.gameId"
          :class="{
            // if everybody picked the same team, the game is irrelevant
            'is-game-irrelevant': shouldCollapseIrrelevantGames && leagueUserPicks.numLeagueUsersWithLockedPicks === Math.max(
              (leagueUserPicks[game.gameId] || [[], []])[0].length,
              (leagueUserPicks[game.gameId] || [[], []])[1].length
            ),
            'in-progress': game.phase !== 'PRE' && game.phase !== 'FINAL'
          }"
        >
          <team-card
            :team="game.visitorTeam"
            :isPicked="getWinningTeamOfGame(game) === 'visitor'"
            :usersWhoPickedThisTeam="(leagueUserPicks[game.gameId] || [[], []])[0]"
          ></team-card>
          <span
            class="score"
            :data-is-winner="getWinningTeamOfGame(game) === 'visitor'"
          >
            {{ game.visitorTeam.score }}
          </span>
          <span
            class="score"
            :data-is-winner="getWinningTeamOfGame(game) === 'home'"
          >
            {{ game.homeTeam.score }}
          </span>
          <team-card
            :team="game.homeTeam"
            :isPicked="getWinningTeamOfGame(game) === 'home'"
            :usersWhoPickedThisTeam="(leagueUserPicks[game.gameId] || [[], []])[1]"
          ></team-card>
        </li>
      </template>
      <li
        v-if="tieBreakers.length"
        style="display: block"
      >
        <div>
          Tie breaker total yards
        </div>
        <table>
          <tr
            v-for="tieBreaker in tieBreakers"
          >
            <td>
              {{ (tieBreaker || {}).displayName }}:
            </td>
            <td>
              {{ (tieBreaker || {}).totalYards }}
            </td>
          </tr>
          <tr
            v-if="(sortedGames[sortedGames.length - 1] || {}).totalYards"
            class="tie-breakers__actual-yards"
          >
            <td>Actual:</td>
            <td>{{ sortedGames[sortedGames.length - 1].totalYards }}</td>
          </tr>
        </table>
      </li>
    </ul>
    <div v-if="!picks.isLocked" class="must-have-all-picks-notice">
      Once you <a href="/picks">make your picks</a> for the week and lock them in,
      you can see your King of Football member picks and standings here.<br/><br/>
      (If you already made your picks and locked them in, you may need to refresh this page.
      Sorry for the inconvenience.)
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import TeamCard from '@/components/TeamCard'
  import mixins from '@/mixins'
  import { season, seasonType, week, weeks } from '@/util/season'

  // console.log(season, seasonType, week, weeks)

  export default {
    name: 'Landing',
    mixins: [mixins],
    components: {
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
        return this.games
      },
      picks () {
        console.log('computing `picks`')
        return this.leagueUserPicksForThisWeek() || {}
      },
      numLeagueUsers () {
        return Object.keys(this.league.users || {}).length
      },
      leagueUserPicks () {
        var _this = this
        var leagueUserPicks = {numLeagueUsersWithLockedPicks: 0}
        var leagueUsers = this.league.users
        Object.keys(leagueUsers || {}).forEach(userId => {
          var leagueUserPicksForThisWeek = this.leagueUserPicksForThisWeek(userId)
          leagueUserPicks.numLeagueUsersWithLockedPicks += (leagueUserPicksForThisWeek || {}).isLocked ? 1 : 0
          if (leagueUserPicksForThisWeek) {
            Object.keys(leagueUserPicksForThisWeek || {}).forEach(gameId => {
              // people who picked the visitor team [], people who picked the home team [].
              if (isNaN(+gameId)) return
              leagueUserPicks[gameId] = leagueUserPicks[gameId] || [[], []]
              leagueUserPicks[gameId][+leagueUserPicksForThisWeek[gameId]].push({
                userId: userId,
                displayName: leagueUsers[userId].displayName,
                isCurrentUser: userId === _this.user.uid,
              })
            })
          }
        })
        return leagueUserPicks
      },
      tieBreakers () {
        return Object.keys(this.league.users).map(userId => {
          var totalYards = (this.leagueUserPicksForThisWeek(userId) || {}).totalYards
          return typeof totalYards !== 'undefined' && {
            displayName: this.league.users[userId].displayName,
            totalYards: totalYards,
          }
        }).filter(item => {
          return !!item
        })
      },
    },
    data () {
      return {
        isLoading: true,
        season: season,
        seasonType: seasonType,
        week: week,
        weeks: weeks,
        leagueId: '-KzPdROlkcWZDUsd47av',
        shouldShowLockTotalYardsDialog: false,
        totalYards: null,
        shouldCollapseIrrelevantGames: false,
      }
    },
    watch: {
      user (val) {
        console.log('landing - user watched', val)
        if (val) {
          this.setLeagueRef()
        }
      },
      league (val) {
        console.log('on league updated', val)
        this.isLoading = false
      },
      week (val) {
        console.log('on week updated', val)
      },
    },
    mounted () {
      this.setWeek()
    },
    methods: {
    },
  }
</script>

<style lang="sass">
  .landing
    text-align: center
    padding: 20px 20px 90px

    h1
      font-family: bold-cond, sans-serif
      font-size: 50px

    h1, h2
      font-weight: normal
      color: white

    ul
      list-style-type: none
      padding: 0
      display: inline-flex
      flex-direction: column
      &.blur
        display: none

    li
      display: flex
      margin: 0
      padding: 0 0 40px
      justify-content: center
      align-items: flex-start
      max-height: 200px
      transition: all .3s
      overflow: hidden
    .is-game-irrelevant
      opacity: 0
      max-height: 0
      padding: 0
    .in-progress
      .score
        animation: 2s breathe linear infinite
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
      display: flex
      align-items: flex-start
      flex-direction: row-reverse
      justify-content: space-between
      text-align: right
      &__image
        width: 100px
        height: auto
    .team-card-wrapper
      text-align: right
      & ~ .team-card-wrapper
        text-align: left
        .team-card
          flex-direction: row
          text-align: left

    .score
      color: #999
      font-size: 60px
      width: 70px
      text-align: center
      padding: 10px 0 0

    .score[data-is-winner="true"]
      color: #00adea
      text-shadow: 0 0 20px #999

    .must-have-all-picks-notice
      padding-top: 30px

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

    .mu-switch-label
      color: white
    .mu-switch-thumb
      background-color: gray

    .mu-text-field.has-label
      width: 140px
      color: white
      .mu-text-field-label.float
        color: rgba(255,255,255,.5)
      .mu-text-field-input
        color: white
      .mu-text-field-line
        background: white

    .tie-breakers__actual-yards
      color: #00adea

    table
      margin: 10px auto
    td:first-child
      text-align: left
    td:last-child
      text-align: right
      padding-left: 10px

    @media (max-width: 600px)
      h1
        font-size: 40px
      h3
        text-align: center

      .team-card
        width: auto
        display: block
        &.game-has-pick:not(.picked)
          opacity: .7
        &__image
          width: 106px
          height: auto
      .score
        font-size: 34px
        padding-top: 55px
        width: auto
        min-width: 50px
        flex-grow: 1000
        flex-basis: 30%

  @keyframes breathe
    0%
      opacity: 1
    50%
      opacity: .4
    100%
      opacity: 1

</style>
