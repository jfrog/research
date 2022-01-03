<template>
  <header class="p-2 main-header">
    <div class="container mx-auto">
      <div class="flex w-full justify-between items-center">
        <div class="left">
          <div class="flex items-center gap-2">
            <JFrogLogo />
            <span class="site-name small">{{ $static.metadata.siteName }}</span>
          </div>
        </div>
        <div class="right">
          <TopMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
import JFrogLogo from './JFrogLogo'
import TopMenu from './top-menu/index'
export default {
  components: {
    JFrogLogo,
    TopMenu
  }
}
</script>

<style lang="scss">
  @import './../assets/style/variables';
  .main-header {
    border-bottom: 1px solid $border-gray;
  }
</style>