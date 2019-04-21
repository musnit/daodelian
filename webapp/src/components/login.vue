<template lang='pug'>
.login-wrapper
  //- Login errors
  .metamask-error-popup(v-if='metamaskAuthError')
    template(v-if='metamaskAuthError === "NO_WEB3"')
      h3 Web3 Not Installed!
    template(v-else-if='metamaskAuthError === "DENIED_ACCESS"')
      h3 Allow access to Web3
      p You must allow access to your web3 client.
    template(v-else-if='metamaskAuthError === "SIGNING_ERROR"')
      h3 Something went wrong :(
      p There was a problem logging in using your Web3 client.

  //- Metamask is connected, but user is not logged in
  div(v-else-if='!authUserAddress')
    p Please connect metamask

  div(v-else-if='!authUserSignedMessage')
    button(@click='attemptLogin') Log In Using Metamask!

  div(v-else-if='getUserRequest.isPending')
    div Fetching user info...

  // div(v-else-if='getUserRequest.isPendingOrEmpty')
  //  button(@click='attemptLogin') Log In Using Metamask!

  div(v-else-if='getUserRequest.isPendingOrEmpty')
    router-link(to='/profile').button View Profile

  div(v-else-if='user.address')
    router-link(to='/profile') Logged in as {{ user.username }}


</template>

<script>

import { mapRequestStatuses } from '@/lib/vuex-api';

const { mapState, mapGetters } = require('vuex');

const components = {

};

export default {
  components,
  metaInfo() {
  },
  props: {

  },
  computed: {
    ...mapGetters([
      'authUserAddress', 'authUserSignedMessage', 'metamaskAuthError',
      'user',
    ]),
    ...mapRequestStatuses({
      getUserRequest: 'GET_USER',
    }),
  },
  watch: {
    authUserSignedMessage() {
      if (this.authUserAddress && this.authUserSignedMessage) {
        this.$store.dispatchApiAction('FETCH_AUTH_USER');
      }
    },
  },
  methods: {
    attemptLogin() {
      this.$store.dispatch('attemptLogin');
    },
  },
};
</script>

<style lang="less">
.login-wrapper {
  top: 10px;
  right: 10px;
  position: absolute;

  div {

    button {
      background: #8484c3;
      color: white;
      border: 0;
      border-radius: 20px;
      padding: 8px 15px;
    }
  }
}

.metamask-error-popup {
  position: fixed;
  height: 100%;
  width: 100%;
  padding: 80px;
  background: fade(#F00, 70%);
}


</style>
