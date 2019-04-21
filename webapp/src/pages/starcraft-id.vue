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

export default {
  props: ['scId'],

  data() {
    return {
      buttons,
      flip: 1,
    };
  },

  methods: {
    async submitAction(item) {
      console.log('item', item);
      // TODO: Set player based on idx from participant array
      const player = this.flip === 1 ? 2 : 1;
      this.flip = player;
      await this.addProposal({
        proposedState: {
          player,
          strat: item.id,
        },
      });

      await this.commitProposal();
    },

    getGame() {
      this.$store.dispatchApiAction('FETCH_GAME', { id: this.scId });
    },
    getProposals() {
      this.$store.dispatchApiAction('FETCH_GAME_PROPOSALS', { id: this.scId });
    },
    async addProposal(data) {
      return this.$store.dispatchApiAction('ADD_GAME_PROPOSAL', {
        id: this.scId,
        ...data,
      });
    },
    updateProposal(idx) {
      this.$store.dispatchApiAction('UPDATE_GAME_PROPOSAL', {
        id: this.scId,
        proposedIdx: idx,
        data: {},
      });
    },
    async commitProposal(proposedIdx) {
      return this.$store.dispatchApiAction('COMMIT_GAME_PROPOSAL', {
        id: this.scId,
        // TODO: change to be correct
        participant: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
        proposedIdx,
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
