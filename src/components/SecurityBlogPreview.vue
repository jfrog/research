<template>
  <a 
    class=" block h-full single-post-preview mx-auto"
    :href="postObj.href?postObj.href:postObj.path"
    target="_blank"
    rel="noopener noreferrer"
    data-gac="Links back to JFrog"
    data-gaa="JFrog Blog"
    :data-gal="`${postObj.title} | ${postObj.href?postObj.href:postObj.path}`"
  >
    <div class="image">


      <picture>
        <source
            :srcset="`${postObj.img}?${timestamp}`"
            type="image/webp"
        >
        <img
            :alt="postObj.title"
            :srcset="`${postObj.img}`"
            class="object-contain"
            height="201"
            width="148"
        />
      </picture>

    </div>
    <div>
      <div class="text-xs font-weight-500  green-dark mt-5 lg:mt-0 mb-2" v-html="postObj.tag?postObj.tag:'Blog'"> </div>
      <div class="text-lg font-weight-500 leading-6 text-black  " v-html="postObj.title"> </div>
      <div class="text-xs  text-black mt-3 mb-3" v-html="postObj.description"> </div>
      <p class="text-md text-black"> {{postObj.excerpt}} </p>
      <div class="reading-time flex items-center gap-1">
        
        <g-image
          src="~/assets/img/icons/clock.svg"
          width="12"
          height="12"
          alt="Reading Time"
        />
        <div class="text-jfrog-green text-xs leading-none py-1"> {{postObj.minutes}} min read </div>
      </div>
      <div class="text-right text-black text-xs leading-none py-1">Published on <b>{{postObj.date}}</b> </div>

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
          excerpt: '',
          date:'',
          lastUpdate:'',
          tag:'blog',
        }
      }
    },
    imageIndex: {
      type: String,
      default: '0'
    }
  },
  computed:{
    timestamp(){
      return Math.round(+new Date(this.postObj.lastUpdate)/1000);

    }
  }
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
    grid-template-columns: 183px 1fr;
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



.font-weight-500{
  font-weight: 500;
}
.latest-published{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.image img{

  width: 100%;
  height: auto;
  @media (min-width: #{$md}){
    width: 203px;
    height: 148px;
    object-fit: cover;

  }
}

.green-dark{
  color: #008A09;
}

.single-post-preview {

  display: grid;
  grid-template-columns: 201px 1fr;
  column-gap: 22px;
  max-width: 100%;
  position: relative;
  padding-bottom: 24px;
  padding-top: 24px;

  @media (min-width: #{$md}){
    padding-bottom: 24px;
    padding-top: 24px;
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