<template>
  <g-link
    class="hover:text-jfrog-green transition-all"
    :class="passedClass"
    v-html="`< Back`"
    to="/vulnerabilities/"
  />
</template>

<script>
export default {
  methods: {
    goBack() {
      const r = this.$router
      r.go(-1)
    }
  },
  props: {
    passedClass: {
      type: String,
      default: ''
    },
  }
}
</script>