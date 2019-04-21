<template lang='pug'>
.layout.theme-page-bg
  header.site-header
    login
    router-link.site-logo(to='/')
      h1 DAO-vs-DAO
  .content
    slot
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
body {
  background: black;
  position: relative;
}
.site-logo {
  text-decoration: none;
}
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: pink;
  position: relative;
}
.site-header {

}
.content {
  flex: 1 0 0;
  background: yellow;

}


</style>
