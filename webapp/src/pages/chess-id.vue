<template lang='pug'>
.layout.game-detail
  h1
    | Chess - {{ chessId }}

  div.game-layout
    div.game-controls
      Propose a move by dragging the piece on the chessboard

    div.game-container
        div#board

</template>

<script>
import { mapActions } from 'vuex';
import $ from 'jquery';
import ChessBoard from '@/lib/chessboard-0.3.0';
import Chess from 'chess.js';

export default {
  props: ['chessId'],

  data() {
    return {
      proposingMoveSource: null,
    };
  },
  metaInfo() {
    return {
      style: [{ type: 'text/css', cssText: this.themeStyles }],
    };
  },
  methods: {
    ...mapActions('games', ['startGame']),
    submitSomething() {
      alert('HELLLLLOOOOOOO');
    },
    chessInteraction(move, newPos) {
      // TODO: send proposal of move to server
      this.proposingMoveSource = move.source;
      this.proposingMoveTarget = move.target;

      // disable proposing
      this.board = window.ChessBoard('board', this.notDraggableCfg);
    },

    moveReceived(move) {
      // TODO: this.board.move(move)
      // TODO: re-enable proposing if my turn again
    },

  },
  computed: {
    themeStyles() {
      // css that gets injected into the head
      if (this.proposingMoveSource) {
        return `.square-${this.proposingMoveSource} {background: yellow !important;} .square-${this.proposingMoveTarget} {background: yellow !important;}`;
      }

      return '';
    },
  },


  mounted() {
    this.game = new Chess();
    window.$ = $;
    const onDrop = (source, target, piece, newPos, oldPos, orientation) => {
      const gameMove = this.game.move({
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
      /*     if (this.game.gameOver() === true ||
        (this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (this.game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (this.game.turn() !== side.charAt(0))) {
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
};
</script>

<style lang='less'>
.game-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.game-controls {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

#board {
    width: 400px
}

.game-layout {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) minmax(450px, 4fr) minmax(300px, 1fr);

  iframe {
    min-height: 80vh;
  }

}
</style>
