<template lang='pug'>
layout.about-page
  h1 Your Profile

  template(v-if='!isUserLoggedIn')
    p Please log in!
  template(v-else)
    form-row
      form-input(label='address' v-model='user.address' disabled)
      form-input(label='username' v-model='user.username')

    form-row(:error='updateUserRequest.errorMessage')
      v-button(
        @click='saveButtonHandler'
        :disabled='$vv.$error'
        :loading='updateUserRequest.isPending'
        loading-text='saving profile...'
      ) Save

    br
    br
    form-row
      v-button(
        @click='logoutButtonHandler'
        loading-text='Logging you out...'
      ) Log Out

</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';

import { mapRequestStatuses } from '@/lib/vuex-api';
import { vuelidateGroupMixin } from '@/lib/vuelidate-group';

const components = {
  layout: require('@/components/layout').default,
};


export default {
  components,
  mixins: [vuelidateGroupMixin],
  data: () => ({
    user: {},
  }),
  computed: {
    ...mapGetters({
      storeUser: 'user',
    }),
    ...mapGetters(['isUserLoggedIn']),
    ...mapRequestStatuses({
      getUserRequest: 'GET_USER',
      updateUserRequest: 'UPDATE_USER',
    }),
  },
  watch: {
    storeUser: {
      deep: true,
      handler() { this.user = _.cloneDeep(this.storeUser); },
    },
  },
  methods: {
    saveButtonHandler() {
      this.$store.dispatchApiAction('UPDATE_USER', this.user);
    },
    logoutButtonHandler() {
      this.$store.dispatch('LOGOUT', this.user);
    },
  },
};
</script>

<style lang='less'>

</style>
