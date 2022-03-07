<template>
  <a
    :href="link.to"
    :class="buttonClass"
    :target="link.target"
    :rel="link.rel"
    :data-gac="gac"
    :data-gaa="gaa"
    :data-gal="gal"
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
        rel: '',
      }
    },
    textColor: {
      type: String,
      default: 'black'
    },
    bgColor: {
      type: String,
      default: 'white'
    },
    gac: {
      type: String,
      default: 'CTA Buttons'
    },
    gaa: {
      type: String,
      default: 'Vulnerabilities'
    },
    gal: {
      type: String,
      default: 'See All Vulnerabilities'
    }
  },
}
</script>