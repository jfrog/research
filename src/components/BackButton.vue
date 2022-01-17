<template>
  <button
    class="hover:text-jfrog-green transition-all"
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
}
</script>