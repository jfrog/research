<template>
  <a 
    class="bg-white block border rounded-sm p-1 h-full single-post-preview mx-auto"
    :href="postObj.href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="image aspect-blog-image w-full bg-blue-400">
      
      <picture
        :alt="postObj.title"
        class="w-full h-full object-cover"
        height="182"
        width="315"
      >
          <source
            :srcset="`./latest-posts-${imageIndex}.webp`"
            type="image/webp"
          >
          <img :srcset="`./latest-posts-${imageIndex}.png`" />
      </picture>
      
    </div>
    <div class="p-3">
      <h3 class="text-lg font-bold leading-5 text-black" v-html="postObj.title"> </h3>
      <p class="text-xs py-3 text-black"> {{postObj.description}} </p>
      <div class="reading-time flex items-center gap-1">
        
        <g-image
          src="~/assets/img/icons/clock.svg"
          width="12"
          height="12"
          alt="Reading Time"
        />
        <div class="text-jfrog-green text-xs leading-none py-1"> {{postObj.minutes}} min read </div>
      </div>
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
          img: 'sec-blog-img-1.png'
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
  .aspect-blog-image {
    aspect-ratio: 1.35;
  }
  .single-post-preview {
    width: 350px;
    max-width: 100%;
  }
</style>