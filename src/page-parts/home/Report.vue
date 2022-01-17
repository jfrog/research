<template>
  <section class="report pt-10 sm:pt-36 pb-24 sm:pb-36 text-center">
    <div class="container">
      <h2 v-html="title" />
      <p class="text-center sm:px-5 mt-5">
        The <a href="https://jfrog.com/trust/" target="_blank" rel="noopener noreferrer">security and quality</a> of our code is a top priority for JFrog. If you find a vulnerability or any other type of security issue in one of our products, please report it to us immediately. Security researchers may be able to participate in a bug bounty program and earn rewards for their findings.
      </p>

      <p class="mt-5">
        <a href="https://jfrog.com/trust/report-vulnerability/" target="_blank" rel="noopener noreferrer">Learn more about how to report a vulnerability&nbsp;></a>
      </p>

    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      title: 'Report Vulnerabilities Discovered&nbsp;in JFrog Products',
    }
  },
}
</script>

<style lang="scss">
  @import './../../assets/style/variables';
  section.report {
    a {
      color: $green;
      text-decoration: underline;
    }
  }
</style>