<template>
  <a
    :href="link.to"
    :class="buttonClass"
    :target="link.target"
    :rel="link.rel"
  >
    {{link.title}}
  </a>
</template>

<script>
export default {
  data() {
    return {
      buttonClass: `banner-button inline-block text-${this.textColor} bg-${this.bgColor} px-4 py-3 mt-3`
    }
  },
  props: {
    link: Object,
    default() {
      return {
        to: '/',
        title: 'enter button text',
        target: '_self',
        rel: ''
      }
    },
    textColor: {
      type: String,
      default: 'black'
    },
    bgColor: {
      type: String,
      default: 'white'
    }
  },
}
</script>