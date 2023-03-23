<template>
  <a 
    class=" block h-full single-post-preview mx-auto"
    :href="postObj.href"
    target="_blank"
    rel="noopener noreferrer"
    data-gac="Links back to JFrog"
    data-gaa="JFrog Blog"
    :data-gal="`${postObj.title} | ${postObj.href}`"
  >
    <div class="image">
      
      <picture>
          <source
            :srcset="`./latest-posts-${imageIndex}.webp`"
            type="image/webp"
          >
          <img
            :alt="postObj.title"
            :srcset="`./latest-posts-${imageIndex}.png`"
            class="object-contain"
            height="148"
            width="203"
          />
      </picture>
      
    </div>
    <div>
      <div class="text-lg  leading-6 text-black mt-5 lg:mt-0 lg:font-bold" v-html="postObj.title"> </div>
      <p class="text-xs pt-2 text-black"> {{postObj.description}} </p>
    <div class="text-xs my-2 text-black  text-excerpt"  v-html="postObj.excerpt"> </div>
      <div class="reading-time flex items-center gap-1">
        
        <g-image
          src="~/assets/img/icons/clock.svg"
          width="12"
          height="12"
          alt="Reading Time"
        />
        <div class="text-jfrog-green text-xs leading-none py-1"> {{postObj.minutes}} min read </div>
      </div>
      <div class="w-full text-right text-xs leading-none py-1">Published on <b>{{postObj.date}}</b> </div>

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
          description: 'Post Description Here',
          minutes: '15',
          href: 'https://yahoo.com',
          img: 'sec-blog-img-1.png',
          excerpt: ''
        }
      }
    },
    imageIndex: {
      type: String,
      default: '0'
    }
  },
}
</script>

<style lang="scss">
@import './../assets/style/variables';

  .aspect-blog-image {
    aspect-ratio: 1.35;
  }

.text-excerpt{
  font-size: 12px;
  text-align: justify;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  min-height: 57px;
}

  .image img{

    width: 100%;
    height: auto;
    @media (min-width: #{$md}){
      width: 203px;
      height: auto;
    }
  }

  .single-post-preview {

    display: grid;
    grid-template-columns: 203px 1fr;
    column-gap: 20px;
    max-width: 100%;


    position: relative;


    @media (min-width: #{$md}){
      padding-bottom: 5px;
      width: 750px;
      &:after{
        content: "";
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
        height: 1px;
        background-color: #9CA3AF;

      }
    }
    @media (max-width: #{$md}) {
     width: 100%;
      grid-template-columns: 100%;
    }
    }

</style>