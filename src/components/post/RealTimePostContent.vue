<template>
  <div class="post-content-wrapper">
    <section
        v-html="content"
        ref="codeSection"
        class="latest-posts-single-post-content text-black"
    />

    <ImageModal
        :visible="isModalVisible"
        :image-url="selectedImageUrl"
        @close="closeModal"
    />
  </div>
</template>

<script>
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
import ImageModal from '../ImageModal.vue';

export default {
  name: 'PostContent',
  components: {
    ImageModal, // Register the modal component
  },
  props: {
    content: {
      type: String,
      default: 'lorem ipsum'
    },
  },
  data() {
    return {
      isModalVisible: false,
      selectedImageUrl: '',
    };
  },
  methods: {
    // Existing method for code highlighting
    highlightCode() {
      // It's important to check if the ref exists before querying the DOM
      if (!this.$refs.codeSection) return;

      const codeBlocks = this.$refs.codeSection.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightBlock(block);
      });
    },

    //  Attach click listeners to images
    attachImageClickEvent() {
      // It's important to check if the ref exists before querying the DOM
      if (!this.$refs.codeSection) return;

      const images = this.$refs.codeSection.querySelectorAll('img');

      images.forEach(img => {
        // Prevent attaching the listener multiple times on component updates
        if (img.dataset.clickAttached) return;

        img.style.cursor = 'zoom-in'; // Visual cue for the user

        // 1. Define the handler function
        const clickHandler = (event) => {
          event.preventDefault(); // Prevent default link behavior if the image is wrapped in an <a> tag
          this.openModal(img.src);
        };

        // 2. Attach the native DOM event listener
        img.addEventListener('click', clickHandler);

        // 3. Mark the image as handled
        img.dataset.clickAttached = 'true';
      });
    },

    // 🆕 NEW METHOD: Modal controls
    openModal(url) {
      this.selectedImageUrl = url;
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
      this.selectedImageUrl = '';
    },
  },

  mounted() {
    // Apply syntax highlighting
    this.highlightCode();
    // 🆕 Attach image click event after initial render
    this.attachImageClickEvent();
  },


}
</script>

<style lang="scss">
@import '~/assets/style/variables';

.latest-posts-single-post-content {
  display: flex;
  flex-direction: column;
  gap: 16px;

  /* Paragraphs */
  p {
    font-size: 16px;
    line-height: 1.6;
  }

  /* Headers */
  h1 {
    font-size: 2em;   // largest
    font-weight: 700;
    margin: 1em 0 0.5em;
  }

  h2 {
    font-size: 1.75em;
    font-weight: 700;
    margin: 0.9em 0 0.5em;
    color: #008A09;

  }

  h3 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 0.8em 0 0.4em;
    color: #008A09;

  }

  h4 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 0.7em 0 0.4em;
    color: #008A09;

  }

  h5 {
    font-size: 1.1em;
    font-weight: 500;
    margin: 0.6em 0 0.3em;
    color: #008A09;

  }

  h6 {
    font-size: 1em;
    font-weight: 500;
    margin: 0.5em 0 0.2em;
    color: #555; // slightly lighter for smallest headings
  }

  /* Links */
  a {
    color: #008A09;
    text-decoration: underline;
  }

  h1 a , h2 a, h3 a, h4 a, h5 a, h6 a{
    text-decoration: none;
  }
  /* Lists */
  ul {
    list-style-type: disc;
    padding-left: 20px;
    li {
      margin-bottom: 4px;
      line-break: auto;
    }
  }

  ol {
    list-style-type: decimal;
    padding-left: 20px;
    li {
      margin-bottom: 4px;
      line-break: auto;
    }
  }

  /* Inline code */
  code:not(pre code) {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 90%;
    color: #d63384;
  }

  /* Code blocks */
  pre {
    background: #282c34 !important;
    padding: 12px !important;
    border-radius: 4px !important;
    overflow-x: auto;
  }

  pre code {
    background: none !important;
    color: #f5f5f5;
    font-size: 90%;
  }

  code::before,
  code::after {
    content: none !important;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 16px;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
    font-weight: 600;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
}
</style>
