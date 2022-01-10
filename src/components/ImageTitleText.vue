<template>
  <div class="container mx-auto px-2">
    <section
      class="cmp-image-title-text flex flex-col sm:flex-row pt-5 pb-20 items-center justify-between gap-2 sm:gap-8"
    >
      
      <div class="media w-full flex-row-reverse sm:flex-row sm:w-2/12 text-center flex items-center justify-between gap-4">
        <slot></slot>
        <h2 class="block sm:hidden text-left">{{title}}</h2>
      </div>
    
      <div class="content w-full sm:w-10/12 text-center sm:text-left">
        <h2 class="hidden sm:inline">{{title}}</h2>
        <p class="block text-left" v-html="par"></p>
      </div>


    </section>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'title here'
    },
    par: {
      type: String,
      default: 'par here'
    },
  }
}
</script>

<style lang="scss">
  @import './../assets/style/variables';
  .cmp-image-title-text {
    h2 {
      max-width: 150px;
    }
    img {
      max-width: 94px;
    }
    @media screen and (min-width: #{$sm}) {
      h2 {
        max-width: 100%;
      }
      img {
        max-width: 100%;
      }
    }
  }
</style>