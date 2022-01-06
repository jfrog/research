<template>
  <a
    :href="link.to"
    class="banner-button inline-block text-black bg-white px-4 py-3 mt-3"
    :target="link.target"
    :rel="link.rel"
  >
    {{link.title}}
  </a>
</template>

<script>
export default {
  props: {
    link: Object,
    default() {
      return {
        to: '/',
        title: 'enter button text',
        target: '_self',
        rel: ''
      }
    }
  },
}
</script>