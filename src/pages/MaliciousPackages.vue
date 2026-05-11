<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    // This handles the redirect instantly when the page loads
    this.$router.replace('/');
  },
  metaInfo() {
    return {
      title: 'Redirecting...',
      meta: [
        // This is the "Meta Refresh" that acts as a fallback
        { 'http-equiv': 'refresh', content: '0; url=/' }
      ],
      link: [
        // Tells Google the real page is the home page
        { rel: 'canonical', content: 'https://research.jfrog.com/' }
      ]
    }
  }
}
</script>