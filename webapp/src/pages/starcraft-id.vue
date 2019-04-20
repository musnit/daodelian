<template lang='pug'>
.layout.game-detail
  h1
    | Starcraft 2 - {{ scId }}

  div.game-layout
    div.game-controls
      button(@click.prevent='submitSomething')
        span
          | Action 1
      button
        span
          | Action 2
      button
        span
          | Action 3
      button
        span
          | Action 4

      div.proposals
        div.prop-item(v-for='item in game.pendingState')
          {{ commitHash }}

    div.game-container
      iframe(
        src='https://player.twitch.tv/?channel=musnit'
        frameborder='0'
        allowfullscreen='true'
        scrolling='no'
        height='100vh'
        width='100%'
      )

    div.game-chat
      iframe(
        src='https://www.twitch.tv/embed/musnit/chat'
        frameborder='0'
        allowfullscreen='true'
        scrolling='no'
        height='100vh'
        width='100%'
      )
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: ['scId'],

  methods: {
    // ...mapActions('games', ['startGame']),
    submitSomething() {
      alert('HELLLLLOOOOOOO');
    },

    getGame() {
      this.$store.dispatchApiAction('FETCH_GAME', { id: this.scId });
    },
    getProposals() {
      this.$store.dispatchApiAction('FETCH_GAME_PROPOSALS', { id: this.scId });
    },
    addProposal() {
      this.$store.dispatchApiAction('ADD_GAME_PROPOSAL', { id: this.scId });
    },
    updateProposal(idx) {
      this.$store.dispatchApiAction('UPDATE_GAME_PROPOSAL', {
        id: this.scId,
        proposedIdx: idx,
        data: {},
      });
    },
    deleteProposal(idx) {
      this.$store.dispatchApiAction('DELETE_GAME_PROPOSALS', { id: this.scId });
    },
  },

  async mounted() {
    await this.getGame();
    await this.getProposals();
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

.game-layout {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) minmax(450px, 4fr) minmax(300px, 1fr);

  iframe {
    min-height: 80vh;
  }
}
</style>
