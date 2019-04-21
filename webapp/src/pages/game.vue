<template lang='pug'>
layout.game-page
  template(v-if='fetchGameRequest.isPendingOrEmpty')
    h1 Loading...
  template(v-else-if='fetchGameRequest.isError')
    h1 Error - {{ fetchGameRequest.errorMessage }}
  template(v-else-if='game.channelId')
    .game-area
      header.game-header
        .game-type {{ GAME_LABELS[game.gameType] }}
        .matchup
          router-link(:to='`/team/${game.team0.id}`') {{ game.team0.name }}
          | &nbsp;- vs -&nbsp;
          router-link(:to='`/team/${game.team1.id}`') {{ game.team1.name }}
      .moves
        .proposal-area
          h3 Create Proposal
          div(v-if='game.gameType === "chess"')
            | Propose a move by dragging the piece on the chessboard
          div(v-else-if='game.gameType === "sc2"')
            div Select primary unit for strategy
            button(
              v-for="item in sc2Buttons"
              @click.prevent='submitSC2Action(item)'
            ).sc2-button
              img(:src='item.src')
              span {{item.name}}
        .voting-area
          h3 Vote
          div(v-if='game.gameType === "chess"')

          div(v-else-if='game.gameType === "sc2"')

      .game
        div(v-if='!game.isStarted')
          p Game has not begun yet
          v-button(@click='beginGameButtonHandler') Begin the game
        div(v-else)
          template(v-if='game.gameType === "chess"')
            .whos-turn
              | Turn: {{ game['team'+game.gameState.whosTurn].name }}
            #board

          template(v-else-if='game.gameType === "sc2"')
            iframe(
              src='https://player.twitch.tv/?channel=musnit'
              frameborder='0'
              allowfullscreen='true'
              scrolling='no'
              height='100%'
              width='100%'
            )
      .chat
        iframe(
          src='https://www.twitch.tv/embed/musnit/chat'
          frameborder='0'
          allowfullscreen='true'
          scrolling='no'
          height='100%'
          width='100%'
        )
</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import $ from 'jquery';
import ChessBoard from '@/lib/chessboard-0.3.0';

import { mapRequestStatuses } from '@/lib/vuex-api';
import { vuelidateGroupMixin } from '@/lib/vuelidate-group';

const components = {
};

const GAME_LABELS = {
  chess: 'Chess',
  sc2: 'Starcraft 2',
};

export default {
  components,
  mixins: [vuelidateGroupMixin],
  metaInfo() {
    if (this.game.gameType !== 'chess') return {};
    return {
      style: [{ type: 'text/css', cssText: this.themeStyles }],
    };
  },
  data: () => ({
    team: {},
    createGamePayload: {},
  }),
  props: {
    gameId: String,
  },
  computed: {
    GAME_LABELS: () => GAME_LABELS,

    ...mapGetters(['game']),
    ...mapGetters([
      'isUserLoggedIn', 'authUserAddress',
      'teams',
    ]),
    ...mapRequestStatuses({
      fetchGameRequest: 'FETCH_GAME',
    }),
    createOrUpdateTeamRequest() {
      return this.team.id ? this.updateTeamRequest : this.createTeamRequest;
    },

  },
  watch: {
    game() {
      if (this.game.gameType === 'chess' && this.game.isStarted) {
        setTimeout(() => {
          this.initChessGame();
        }, 200);
      }
    },
  },
  methods: {
    beginGameButtonHandler() {
      this.$store.dispatchApiAction('BEGIN_GAME');
    },
    async submitSC2Action(item) {
      console.log('item', item);
      // TODO: Set player based on idx from participant array
      const player = this.flip === 1 ? 2 : 1;
      this.flip = player;
      window.api.post(`/sc2/strat/${this.flip}/${item.id}`);
    },
    initChessGame() {
      const onDrop = (source, target, piece, newPos, oldPos, orientation) => {
        console.log(source, target, piece, newPos, oldPos, orientation);
        const move = { source, target };
        this.chessInteraction(move, newPos);
        return 'snapback';
      };
      this.draggableCfg = {
        draggable: true,
        dropOffBoard: 'snapback', // this is the default
        position: 'start',
        onDrop,
      };
      this.notDraggableCfg = {
        draggable: false,
        dropOffBoard: 'snapback', // this is the default
        position: 'start',
        onDrop,
      };

      this.board = window.ChessBoard('board', this.draggableCfg);
    },
    chessInteraction(move, newPos) {
      // TODO: send proposal of move to server
      this.proposingMoveSource = move.source;
      this.proposingMoveTarget = move.target;

      // disable proposing
      this.board = window.ChessBoard('board', this.notDraggableCfg);
    },

  },
  async mounted() {
    window.$ = $;
    await this.$store.dispatchApiAction('FETCH_GAME', this.gameId);
  },
};
</script>

<style lang='less'>
@import '~@/assets/style/chess.css';

.game-page {

}
.game-header {
  height: 60px;
  position: absolute;
  top: 0;
}
.game-area {
  height: 100%;
  padding-top: 60px;
  position: relative;
  flex: 1 0 0;
  display: flex;

  .moves {
    width: 300px;
    background: red;
    display: flex;
    flex-direction: column;

    .moves-area, .proposal-area {
      flex: 50% 0 0;
    }
  }
  .chat {
    width: 300px;
    background: blue;
  }
  .game {
    flex: 1 0 0;
    background: green;
  }
}

#board {
  width: 100%;
  max-width: 400px;
}

</style>
