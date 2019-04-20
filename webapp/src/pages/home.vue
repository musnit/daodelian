<template lang='pug'>
  layout.home-page

</template>

<script>
const components = {
  layout: require('@/components/layout').default,
};

export default {
  components,
  metaInfo: {
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
