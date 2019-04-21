<template lang='pug'>
  layout.home-page
    div.backdrop
      img(src='/ocs_background.jpg')
    h2 Teams
    div(v-if='getTeamsRequest.isPendingOrEmpty')
      small No Teams Found
    div(v-else-if='getTeamsRequest.isError')
      small No Teams Found
    div(v-else).team-edit
      v-button(@click='addTeamButtonHandler').orange Create a new team
      h3 Current Teams
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

ul {
  margin: 0;
  padding: 0;

  li {
    list-style: none;
    padding: 0;
  }
}

.team-edit {
  display: flex;
  flex-direction: column;

  button.orange {
    background: #F65E25;
    border-radius: 25px;
    display: block;
    margin: 10px auto;
  }

  h3 {
    margin: 40px 0 0;
  }

  ul {
    width: 320px;
    margin: 10px auto 40px;
  }

  li a {
    background: white;
    border-radius: 4px;
    display: block;
    padding: 10px;
    margin: 2px 0px;
  }
}
</style>
