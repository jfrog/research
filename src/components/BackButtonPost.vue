<template>
  <a
      class="hover:text-jfrog-green transition-all"
      :class="passedClass"
      href="#"
      @click.prevent="goBack()"
  >
    < Back
  </a>
</template>

<script>
export default {
  methods: {
    goBack() {
      // Get the referrer URL
      const referrer = document.referrer;


      if (!referrer || window.history.length <= 1) {
        this.$router.push('/post/');
        return;
      }

      const referrerUrl = new URL(referrer);

      const currentHostname = window.location.hostname;

      if (referrerUrl.hostname === currentHostname) {
        window.history.back();
      } else {
        this.$router.push('/post/');
      }
    }
  },
  props: {
    passedClass: {
      type: String,
      default: ''
    }
  }
}
</script>