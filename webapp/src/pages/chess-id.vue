<template lang='pug'>
layout.game-detail
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
import ChessBoard from 'chessboardjs';
import $ from 'jquery';

export default {
  props: ['chessId'],

  methods: {
    ...mapActions('games', ['startGame']),
    submitSomething() {
      alert('HELLLLLOOOOOOO');
    },
  },

  mounted() {
    window.$ = $;
    const cfg = {
      draggable: true,
      dropOffBoard: 'snapback', // this is the default
      position: 'start',
    };
    this.board = ChessBoard('board', cfg);
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
