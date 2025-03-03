<template>
  <section
      v-html="content"
      ref="codeSection"
      class="single-post-content mt-single-post-content mt-3 py-5 sm:py-8 px-4 sm:px-10 text-black border-black border-b text-xs"
  />

</template>

<script>
import hljs from 'highlight.js'; // Import Highlight.js
import 'highlight.js/styles/xcode.css'; // Import the desired style

export default {
  name: 'PostContent',
  props: {
    content: {
      type: String,
      default: 'lorem ipsum'
    },


  },
  methods: {
    highlightCode() {

      // Target only the code blocks in the section
      const codeBlocks = this.$refs.codeSection.querySelectorAll('pre code');
      console.log(codeBlocks)
      codeBlocks.forEach((block) => {
        hljs.highlightBlock(block); // Highlight the code block
      });
    },
  },
  mounted() {
    console.log('codeBlocks')

    // Apply syntax highlighting when mounted
    this.highlightCode();
  },
}
</script>

<style lang="scss">
@import '~/assets/style/variables';

.single-post-content {
  font-size: 16px;
  line-height: 1.5;
    max-width: 100%;
    overflow: hidden;

  a{
    max-width: 100%;
    display: block;
    word-break: break-word;
  }
  p{
    font-size: 1em;
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
  code {
    background-color: #EAEEF5;
    color: black;
  }

  .hljs, pre {
    background-color: transparent; // Keep background transparent
  }
}
.mt-single-post-content{
  padding-left: 0px;
}
</style>