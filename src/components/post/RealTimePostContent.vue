<template>
  <section
      v-html="content"
      ref="codeSection"
      class="latest-posts-single-post-content text-black"
  />

</template>

<script>

export default {
  name: 'PostContent',
  props: {
    content: {
      type: String,
      default: 'lorem ipsum'
    },


  },
  methods: {

  },
  mounted() {

  },
}
</script>

<style lang="scss">
@import '~/assets/style/variables';

.latest-posts-single-post-content{
  display: flex;
  flex-direction: column;
  gap: 32px;
  p{
    font-size: 16px;
    line-height: 1.6;
  }
  a{
    color: #008A09;
  }

}

</style>