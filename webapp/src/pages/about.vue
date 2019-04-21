<template lang='pug'>
layout.about-page(
)
  h1 About
  h3 Ethereum is at its best as a coordination layer
  div.box
    p
      | Sadly, our tools for coordination are underdeveloped.
      br
      br
      | We need to create a new class of tool to help us experiment with many types of intelligence strategy as quickly as we possibly can.
      br
      br
      | Our goal is to create a tool to help us rapidly evolve our coordinated intelligence.
      br
      br
      | We've taken cues from research in AI to create a framework in which teams coordinate around a game environment. By focusing the teams on a clear set of rewards (winning the game), teams should be able to quickly test many different practical methods for coordinating intelligence. Winning strategies should be adapted for use by other teams; losing strategies should be revised or discarded.

</template>

<script>

const components = {
};


export default {
  components,
  computed: {
  },
};
</script>

<style lang='less'>
.about-page .content {
  background: #FAA233;
  text-align: center;
}

.box {
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}
</style>
