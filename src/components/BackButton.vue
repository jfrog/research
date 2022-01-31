<template>
  <button
    class="hover:text-jfrog-green transition-all"
    :class="passedClass"
    v-html="`< Back`"
    @click="goBack"
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