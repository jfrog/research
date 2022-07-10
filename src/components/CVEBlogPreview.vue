<template>
  <a
    class="flex h-full cve-single-post-preview flex-col sm:flex-row"
    :href="postObj.href"
    target="_blank"
    rel="noopener noreferrer"
    data-gac="Links back to JFrog"
    data-gaa="JFrog Blog"
    :data-gal="`${postObj.title} | ${postObj.href}`"
  >

    <div class="py-3 sm:px-5 sm:py-0">
      <div class="text-sm font-bold leading-4 text-jfrog-green uppercase cve-date" v-html="postObj.publish"> </div>
      <div class="text-sm  leading-4 text-black cve-title" >
        <span class="textMaxLine" v-html="postObj.title"></span>
      </div>
    </div>
    <div class="list-split" v-if="index<2" ></div>

  </a>


</template>

<script>



export default {
  props: {
    postObj: {
      type: Object,
      default() {
        return {
          title: 'Post Title Here',
          publish: '1 JUN 2022',
          description: 'Post Description Here',
          minutes: '15',
          href: 'https://yahoo.com',
          img: 'sec-blog-img-1.png',
        }
      }
    },
    index: {
      default: 0,
    },

  },
}
</script>

<style lang="scss">
@import './../assets/style/variables';

  .cve-single-post-preview {
    max-width: 100%;
    position: relative;
    align-items: center;




    .cve-date{
      height: 1.063rem;
      font-size: 0.813rem;
    }
    .cve-title{
      font-size: 0.813rem;
      line-height: 1rem;
      box-sizing: border-box;
      white-space: pre-line;
      word-wrap: break-word;

    }


    .cve-title .textMaxLine {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    @media (max-width: #{$sm}) {
      justify-content: center;
      .cve-title{

        font-size: 0.813rem;
        width: 100%;
        display: block;

      }
      .list-split{
        border-bottom: 0.5px solid #000000;
        height: 0.5px;
        width: 100%;

      }
    }
    @media (min-width: #{$sm}) {

      .cve-title{
        height: 2.063rem;
        width: 120px;
        max-width: 120px;
        display: inline-block;

      }
      .list-split{
        border-right: 0.5px solid #000000;
        height: 2.75rem;
      }
    }

  }




</style>