<template lang='pug'>
layout.game-detail
  h1 Games
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions('games', ['startGame']),
  },

  mounted() {
    this.startGame();
  },
};
</script>

<style lang='less'>

</style>
