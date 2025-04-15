<template>
  <section
    v-html="content"
    class="single-post-content mt-3 py-5 sm:py-8 px-4 sm:px-10 text-black border-black border-b text-xs"
  />
</template>

<script>
  export default {
    name: 'PostContent',
    props: {
      content: {
        type: String,
        default: 'lorem ipsum'
      }
    },
  }
</script>

<style lang="scss">
  @import '~/assets/style/variables';
  .single-post-content {
    h2 {
      margin-top: 4rem;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
      padding-bottom: 0;
      color: black;
      &:first-child {
        margin-top: 0;
      }
      a {
        color: black;
        text-decoration: none;
      }
    }
    p {
      font-size: 12px;
    }
    a {
      color: $green;
      text-decoration: underline;
    }
    ul{
      list-style: disc;
    }
    ol {
      list-style: auto;
    }
    ul, ol {

      margin-left: 20px;
      margin-bottom: 20px;

      li:first-child {
        margin-top: 15px;
      }

    }
  }
</style>