<template lang='pug'>
.layout.theme-page-bg
  header
    login
    router-link.site-logo(to='/')
      h1 DAO-vs-DAO
  slot
  footer
    p this is the footer
</template>

<script>

const { mapState, mapGetters } = require('vuex');

const components = {
  login: require('./login').default,
  'facebook-logo': require('@/assets/images/facebook.svg?inline').default,
  'instagram-logo': require('@/assets/images/instagram.svg?inline').default,
};

export default {
  components,
  metaInfo() {
  },
  props: {


  },
  computed: {
    ...mapState(['metamask']),
  },
  methods: {
    attemptLogin() {
      this.$store.dispatch('attemptLogin');
    },
  },
};
</script>

<style lang="less">
.site-logo {
  text-decoration: none;
}


</style>
