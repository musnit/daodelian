<template lang='pug'>
  layout.home-page
    div.backdrop
      img(src='/ocs_background.jpg')
    h2 Teams
    div(v-if='getTeamsRequest.isPendingOrEmpty')
      small No Teams Found
    div(v-else-if='getTeamsRequest.isError')
      small No Teams Found
    div(v-else)
      v-button(@click='addTeamButtonHandler') Create a new team
      ul
        li(v-for='t in teams')
          router-link(:to='`/team/${t.id}`') {{ t.name }}

</template>

<script>
import { mapState, mapGetters } from 'vuex';

import { mapRequestStatuses } from '@/lib/vuex-api';

const components = {
};


export default {
  components,
  metaInfo: {
  },
  computed: {
    ...mapGetters(['teams']),
    ...mapRequestStatuses({
      getTeamsRequest: 'GET_ALL_TEAMS',
    }),
  },
  mounted() {
    this.$store.dispatchApiAction('GET_ALL_TEAMS');
  },
  methods: {
    addTeamButtonHandler() {
      this.$store.dispatchApiAction('ADD_TEAM');
    },
  },
};
</script>

<style lang='less'>
.backdrop {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;

  img {
    width: 100%;
  }
}
.home-page {
  color: white;
  text-align: center;
  h2 {
  }
}

</style>
