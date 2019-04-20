<template>
  <div v-html="compiledMarkdown" class="richtext"></div>
</template>

<script>
import md from 'md';

export default {
  props: {
    source: { default: '', type: String },
  },
  computed: {
    compiledMarkdown() {
      return md(this.source, { sanitize: true, breaks: true });
    },
  },
};
</script>

<style lang='less'>
  .richtext {
    a {
      color: inherit;
      text-decoration: none;
      transition: color .2s;
    }
    h2, h3 {
      margin: .3em 0;
    }
    h2 + h3 {
      margin-top: -5px;
      margin-bottom: 10px;
    }
    ul {
      list-style-position: inside;
      padding-left: 5px;
    }


  }
</style>
