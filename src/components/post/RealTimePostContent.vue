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
  gap: 16px;
  p{
    font-size: 16px;
    line-height: 1.6;
  }
  a{
    color: #008A09;
  }
  code:not(pre code) {
    background: #f5f5f5;   // light gray background for inline code
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 90%;
    color: #d63384;
  }
  pre {
    background: #000000 !important; /* black background for code blocks */
    padding: 12px !important;       /* add padding for readability */
    border-radius: 4px !important;
    overflow-x: auto;               /* horizontal scroll if code is wide */
  }
  pre code {
    background: none !important;    /* remove any gray background inside pre */
    color: #f5f5f5;                 /* keep your pink text */
    font-size: 90%;
  }

  code::before,
  code::after {
    content: none !important;
  }

}

</style>