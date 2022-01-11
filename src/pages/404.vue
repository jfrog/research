<template>
<Layout class="is-404">
  <div>
    <div class="container">
      <div class="flex flex-wrap justify-center sm:justify-between flex-row items-center gap-3">
        <div class="content flex-auto text-center sm:text-left">
          <h1 class="text-jfrog-green m-0 sm:p-0 pb-3">{{title}}</h1>
          <p class="m-0 font-bold relative bottom-3">{{description}}</p>
          <g-link :to="link.to">
            {{link.title}}
          </g-link>
        </div>

        <g-image
          src="~/assets/img/404.svg"
          width="469"
          height="433"
          :alt="title"
          class="flex-auto mx-auto"
        />

      </div>
    </div>
  </div>
</Layout>
</template>

<script>
export default {
  data() {
    return {
      title: '404',
      description: 'The page you were looking for couldn\'t be found.',
      link: {
        title: '< Go to Homepage',
        to: '/'
      }
    }
  },
}
</script>


<style lang="scss">
@import '~/assets/style/variables';
.layout.is-404#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  h1 {
    font-size: 60px;
    line-height: 1;
  }
  @media screen and (min-width: #{$sm}) {
    h1 {
      font-size: 240px;
      line-height: 1;
    }
  }
}

</style>