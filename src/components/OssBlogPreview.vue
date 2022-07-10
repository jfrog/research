<template>
  <a 
    class=" flex-col h-full oss-single-post-preview mb-12 gap-3"
    :href="postObj.href"
    target="_blank"
    rel="noopener noreferrer"
    data-gac="Links back to JFrog"
    data-gaa="JFrog Blog"
    :data-gal="`${postObj.title} | ${postObj.href}`"
  >
<!--    <div class=" oss-aspect-blog-image ">-->

<!--      <picture>-->
<!--          <source-->
<!--            :srcset="`../${category}-latest-posts-${imageIndex}.webp`"-->
<!--            type="image/webp"-->
<!--          >-->
<!--          <img-->
<!--            :alt="'latest-posts'"-->
<!--            :srcset="`../${category}-latest-posts-${imageIndex}.png`"-->
<!--            class=" "-->

<!--          />-->
<!--      </picture>-->

<!--    </div>-->
    <div class="mt-4">
      <div class="text-md font-bold leading-5 text-black"  v-html="postObj.title"> </div>
      <div class="oss-blog-info">
        <div class="textMaxLine" v-html="postObj.content"></div>

      </div>
      <span class="read-more">
          Read More <span>> </span>
        </span>


    </div>
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
          content: 'Post Description Here',
          href: 'https://yahoo.com',
          img: 'sec-blog-img-1.png'
        }
      }
    },
    imageIndex: {
      type: String,
      default: '0'
    },
    category:{
      type: String,
      default: 'log4shell'
    }
  },
}
</script>

<style lang="scss">
  .oss-aspect-blog-image {
    max-width: 100%;
    img{
      width: 100%;
      max-width: 100%;
      height: auto;
    }
    //max-height: 77px;
    //max-width: 77px;
  }
  .oss-single-post-preview {
    max-width: 100%;
  }
  .oss-blog-info{
    font-size: 0.813rem;
    box-sizing: border-box;
    white-space: pre-line;
    word-wrap: break-word;
    line-height: 22px;
    font-size: 15px;


  }
  .read-more{
    color: #555555;
    font-size: 15px;
    font-weight: bold;
    line-height: 22px;

    span{
      color: #40BE46;
    }
  }


  .oss-blog-info .textMaxLine {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
</style>