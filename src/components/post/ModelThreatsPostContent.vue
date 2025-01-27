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
    },


  },
}
</script>

<style lang="scss">
@import '~/assets/style/variables';

.single-post-content {
  font-size: 16px;
  line-height: 1.5;
  @media (max-width: #{$sm}) {
    max-width: 100%;
  }
  a{
    max-width: 100%;
    display: block;
    word-break: break-word;
  }
  h2 {
    margin-top: 48px;
    font-size: 28px;
    padding-bottom: 0;
    color: black;
    font-weight: 500;
    margin-bottom: 25px;

    &:first-child {
      margin-top: 0;
    }

    a {
      color: black;
      text-decoration: none;

    }
  }

  a {
    color: $green;
    text-decoration: underline;
  }

  pre {
    margin-bottom: 21px;
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