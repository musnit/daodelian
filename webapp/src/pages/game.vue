<template lang='pug'>
layout.game-page
  template(v-if='!fetchGameRequest.wasRequested || !game.gameType')
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
              @click.prevent='createStarcraftProposal(item.id)'
            ).sc2-button
              img(:src='item.src')
              span {{item.name}}
        .voting-area
          h3 Vote
          div(v-else-if='')
            div(v-for='p in game.proposals')
              v-button(@click='voteForProposal(p.id)')
                span(v-if='game.gameType === "sc2"')
                  .sc2-proposal
                  img(:src='sc2Lookup[p.strategy].src' v-if='sc2Lookup[p.strategy]')
                  span(v-if='sc2Lookup[p.strategy]') {{sc2Lookup[p.strategy].name}}
                span(v-if='game.gameType === "chess"')
                  | Move - {{ p.move }}
                span.numvotes - {{ p.votes || 0 }}

      .game
        div(v-if='!game.isStarted')
          p Game has not begun yet
          v-button(@click='beginGameButtonHandler') Begin the game
        template(v-else)
          template(v-if='game.gameType === "chess"')
            #board
            .whos-turn
              | Turn: {{ game['team'+game.gameState.whosTurn].name }}

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
import Chess from 'chess.js';

import { mapRequestStatuses } from '@/lib/vuex-api';
import { vuelidateGroupMixin } from '@/lib/vuelidate-group';

const components = {
};

const GAME_LABELS = {
  chess: 'Chess',
  sc2: 'Starcraft 2',
};

const sc2Buttons = [
  {
    id: 'zealot',
    name: 'Zealot',
    src: require('@/assets/images/zealot.jpg'),
  },
  {
    id: 'stalker',
    name: 'Stalker',
    src: require('@/assets/images/stalker.jpg'),
  },
  {
    id: 'sentry',
    name: 'Sentry',
    src: require('@/assets/images/sentry.jpg'),
  },
  {
    id: 'adept',
    name: 'Adept',
    src: require('@/assets/images/adept.jpg'),
  },
];

const sc2Lookup = {
  zealot: {
    id: 'zealot',
    name: 'Zealot',
    src: require('@/assets/images/zealot.jpg'),
  },
  stalker: {
    id: 'stalker',
    name: 'Stalker',
    src: require('@/assets/images/stalker.jpg'),
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry',
    src: require('@/assets/images/sentry.jpg'),
  },
  adept: {
    id: 'adept',
    name: 'Adept',
    src: require('@/assets/images/adept.jpg'),
  },
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
    sc2Buttons,
    proposingMoveSource: null,
    sc2Proposals: [],
    chessProposals: [],
    sc2Lookup,
    firstTime: true,
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
    themeStyles() {
      // css that gets injected into the head
      if (this.proposingMoveSource) {
        return `.square-${this.proposingMoveSource} {background: yellow !important;} .square-${this.proposingMoveTarget} {background: yellow !important;}`;
      }

      return '';
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
    'game.gameState': {
      deep: true,
      handler() {
        if (this.board) {
          console.log(this.game.gameState.boardState);
          this.board = window.ChessBoard('board', Object.assign({}, this.draggableCfg, { position: this.game.gameState.boardState }));
        }
      },
    },
  },
  methods: {
    beginGameButtonHandler() {
      this.$store.dispatchApiAction('BEGIN_GAME');
    },
    async createStarcraftProposal(strategy) {
      await this.$store.dispatchApiAction('CREATE_PROPOSAL', { strategy });
    },
    async createChessProposal(move, boardState) {
      await this.$store.dispatchApiAction('CREATE_PROPOSAL', { move, boardState });
    },
    async voteForProposal(proposalId) {
      await this.$store.dispatchApiAction('VOTE_FOR_PROPOSAL', {
        id: proposalId,
      });
    },

    async submitSC2Action(item) {
      console.log('item', item);
      // TODO: Set player based on idx from participant array
      const player = this.flip === 1 ? 2 : 1;
      this.flip = player;
      const newProposal = { strategy: item.id };
      this.sc2Proposals.push(newProposal);
    },
    async submitChessAction(move, board) {
      this.createChessProposal(move, board);
    },
    voteFor(item) {
      window.api.post(`/sc2/strat/${this.flip}/${item.strategy}`);
    },
    initChessGame() {
      if (!this.firstTime) {
        return;
      }
      this.firstTime = false;
      this.chessLogic = new Chess();
      const onDrop = (source, target, piece, newPos, oldPos, orientation) => {
        const gameMove = this.chessLogic.move({
          from: source,
          to: target,
          promotion: 'q',
        });
        if (gameMove === null) { return 'snapback'; }

        console.log(source, target, piece, newPos, oldPos, orientation);
        const move = { source, target };
        this.chessInteraction(move, newPos);
        return 'snapback';
      };
      const onDragStart = function (source, piece, position, orientation) {
      /*     if (this.chessLogic.gameOver() === true ||
        (this.chessLogic.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (this.chessLogic.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (this.chessLogic.turn() !== side.charAt(0))) {
        return false;
      } */
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
      //  this.board = window.ChessBoard('board', this.notDraggableCfg);
      const boardState = this.chessLogic.fen();
      this.submitChessAction(move, boardState);
    },

  },
  async mounted() {
    window.$ = $;
    setInterval(async () => {
      await this.$store.dispatchApiAction('FETCH_GAME', this.gameId);
    }, 5000);
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

    > div {
      height: 100%;
    }
  }
}

.sc2-button {
    padding: 0px;
    width: 88px;
    font-style: normal;
    font-weight: bold;
    height: 108px;
    margin: 5px;
}

.voting-divs {
    border-bottom: 2px solid;
    font-weight: bold;
    color: wheat;
}

.sc2-proposal {
    width: calc(100% - 2px);
    display: flex;
    align-items: center;
    border: 2px solid;
    font-weight: bold;
    color: wheat;
    border-bottom: none;
    justify-content: space-between;

  img {
    padding-right: 5px;
  }

  button {
    margin-right: 20px;
    background: wheat;
    border: none;
    color: #551a8a;
    background: #fcff00;
    font-weight: bold;
    font-size: 26px;
  }
}

#board {
  width: 100%;
  max-width: 400px;
}

</style>
