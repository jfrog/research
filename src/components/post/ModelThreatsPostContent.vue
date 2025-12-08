<template>
  <div class="model-threats-theme">
  <section
      v-html="content"
      ref="codeSection"
      class="single-post-content mt-single-post-content mt-3 py-5 sm:py-8 px-4 sm:px-10 text-black border-black border-b text-xs"
  />
  </div>
</template>

<script>
import hljs from 'highlight.js'; // Import Highlight.js
// import 'highlight.js/styles/xcode.css'; // Import the desired style

export default {
  name: 'PostContent',
  props: {
    content: {
      type: String,
      default: 'lorem ipsum'
    },


  },
  data() {
    return {
      styleId: 'highlight-xcode-style'
    };
  },
  methods: {
    highlightCode() {

      // Target only the code blocks in the section
      const codeBlocks = this.$refs.codeSection.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block); // Highlight the code block
      });
    },
    applyStyle() {
      if (!document.getElementById(this.styleId)) {
        // 2. Dynamically create a <link> element
        const style = document.createElement('link');
        style.id = this.styleId;
        style.rel = 'stylesheet';
        style.type = 'text/css';
        // 3. Set the href to the specific style file
        // NOTE: You might need to adjust the path based on your build system
        style.href = '/highlight-themes/xcode.css';

        // 4. Append the style to the document head
        document.head.appendChild(style);
      }
    },

  },

  mounted() {
    this.applyStyle();
    // Apply syntax highlighting when mounted
    this.highlightCode();
  },
}
</script>

<style lang="scss">
@import  '~/assets/style/variables';

.mt-single-post-content {
  font-size: 16px;
  line-height: 1.5;
    max-width: 100%;
    overflow: hidden;

  a{
    max-width: 100%;
    color: $green;
    text-decoration: underline;
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