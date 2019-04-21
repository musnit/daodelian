<template lang='pug'>
  .layout.home-page

    h2 Teams
    div(v-if='getTeamsRequest.isPendingOrEmpty')
    div(v-else-if='getTeamsRequest.isError')
    div(v-else)
      ul
        li(v-for='t in teams')
          router-link(:to='`/team/${t.id}`') {{ t.name }}

</template>

<script>
import { mapState, mapGetters } from 'vuex';

import { mapRequestStatuses } from '@/lib/vuex-api';

const components = {
  layout: require('@/components/layout').default,
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
};
</script>

<style lang='less'>
.slideshow {
  position: absolute;

  top: @body-padding;
  bottom: @body-padding;
  left: @body-padding;
  right: @body-padding;

  @media @mq-small-only {
    top: @body-padding-mobile;
    bottom: @body-padding-mobile;
    left: @body-padding-mobile;
    right: @body-padding-mobile;
  }

  left: 20px;
  top: 20px;
  right: 20px;
  bottom: 20px;
  overflow: hidden;
  .slideshow__image {
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
  }
}
</style>
