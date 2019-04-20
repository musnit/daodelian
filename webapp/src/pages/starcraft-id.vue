<template lang='pug'>
.layout.game-detail
  h1
    | Starcraft 2 - {{ scId }}

  div.game-layout
    div.game-controls
      button(
        v-for="item in buttons"
        @click.prevent='submitAction(item)'
      )
        img(:src='item.src')
        span {{item.name}}

      div.proposals
        // div.prop-item(v-for='item in game.pendingState')
          // | {{ item.commitHash }}

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

const buttons = [
  {
    id: 1,
    name: 'Zealot',
    src: require('@/assets/images/zealot.jpg'),
  },
  {
    id: 2,
    name: 'Stalker',
    src: require('@/assets/images/stalker.jpg'),
  },
  {
    id: 3,
    name: 'Sentry',
    src: require('@/assets/images/sentry.jpg'),
  },
  {
    id: 4,
    name: 'Adept',
    src: require('@/assets/images/adept.jpg'),
  },
];

export default {
  props: ['scId'],

  data() {
    return {
      buttons,
    };
  },

  methods: {
    // ...mapActions('games', ['startGame']),
    submitAction(item) {
      console.log('item', item);
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
