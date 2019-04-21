<template lang='pug'>
.layout.theme-page-bg
  header.site-header
    login
    router-link.site-logo(to='/')
      h1 🏅 DAO vs DAO
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
  background: #e2e2e2;
  position: relative;
  font-family: Avenir, Futura, Helvetica, sans-serif;
}
.site-logo {
  display: flex;
  text-decoration: none;
}
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  // background: pink;
  position: relative;
}
.site-header {
  display: flex;
  background: white;
  justify-content: center;
  height: 54px;

  h1 {
    margin: auto 10px;
    padding: 0;
  }
}
.content {
  flex: 1 0 0;
  background: rgba(37, 37, 37, 0.9);
}


</style>
