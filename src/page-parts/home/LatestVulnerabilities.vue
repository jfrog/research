<template>
  <div class="container mx-auto px-2 pb-20">
    <section
      id="latestVulnerabilities"
    >
      <h2 class="mb-2 sm:mb-5 md:mb-10">{{title}}</h2>
      
      <div class="flex flex-col lg:pl-10 lg:flex-row-reverse gap-3 lg:gap-9">
        <div class="banner-col justify-center flex mb-4 lg:mb-0">
          <Banner :number="'500'" />
        </div>
        <div class="list-col flex-auto">
          <VulnerList />
        </div>
      </div>

    </section>
  </div>
</template>

<script>
import Banner from './../../components/Banner'
import VulnerList from './../../components/VulnerList'
export default {
  data() {
    return {
      title: 'Latest vulnerabilities discovered by the team',
    }
  },
  components: {
    Banner,
    VulnerList
  }
}
</script>

<style lang="scss">
  @import './../../assets/style/variables';
</style>