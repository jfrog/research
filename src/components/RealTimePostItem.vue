<template>
  <a
      class=" block h-full single-post-preview"
      :href="postObj.path"
      target="_self"
      rel=""
      data-gac="Links back to JFrog"
      data-gaa="Latest Security Blog"
      :data-gal="`${postObj.title} | ${postObj.path}`"
  >
    <div class="image">

      <picture>
        <source
            :srcset="`${postObj.img}`"
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
      <div class="text-xs font-weight-500  green-dark mt-5 lg:mt-0 mb-2" v-html="postObj.tag"> </div>
      <div class="text-lg font-weight-500 leading-6 text-black  " v-html="postObj.title"> </div>
      <div class="text-xs  text-black mt-3 mb-3" v-html="postObj.description"> </div>
      <p class="text-md text-black"> {{postObj.excerpt}} </p>
      <div class="latest-published mt-3">
        <div class=" text-right text-black text-xs leading-none py-1">Published on <b>{{postObj.date}}</b> </div>
      </div>
    </div>
  </a>
</template>

<script>

import {toBlogDateStr,} from '~/js/functions'

export default {
  props: {
    postObj: {
      type: Object,
      default() {
        return {
          path: '1',
          title: 'Post Title Here',
          description: 'Post Description Here',
          date: '15',
          img: 'sec-blog-img-1.png',
          tag: 'realtime',

        }
      }
    },

  },
  computed:{

    dateString() {
      return toBlogDateStr(this.postObj.date)
    },
  }
}
</script>

<style lang="scss">
@import './../assets/style/variables';



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