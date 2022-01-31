<template>
  <header class="py-2 main-header">
    <div class="container mx-auto px-2">
      <div class="flex w-full justify-between items-center">
        <div class="left">
          <div class="flex items-center gap-2">
            <JFrogLogo />
            <span class="site-name small">{{ $static.metadata.siteName }}</span>
          </div>
        </div>
        <div class="right">
          <div class="hidden sm:block desktop-menu-wrapper">
            <TopMenu />
          </div>
          <div class="sm:hidden flex item-center mobile-menu-wrapper gap-2">
            
            <!-- to be enabled in the feature -->
            <button v-if="false" class="search px-1">
              <g-image
                src="~/assets/img/buttons/search.svg"
                :immediate="true"
                alt="Search"
              />
            </button>
            
            <button
              @click="isShowMobileMenu = true"
              class="show-menu-hamburger px-1"
            >
              <g-image
                src="~/assets/img/buttons/hamburger.svg"
                :immediate="true"
                alt="Menu"
              />
            </button>
            
          </div>
        </div>
      </div>
    </div>
    <transition name="fade">
      <MobileMenu @close="isShowMobileMenu = false" v-show="isShowMobileMenu" />
    </transition>
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
import MobileMenu from "~/components/MobileMenu.vue";

export default {
  data() {
    return {
      isShowMobileMenu: false
    }
  },
  components: {
    JFrogLogo,
    TopMenu,
    MobileMenu
  }
}
</script>

<style lang="scss">
  @import './../assets/style/variables';
  .main-header {
    border-bottom: 1px solid $border-gray;
  }
  .mobile-menu {
    transition: opacity .5s;
  }
  .fade-enter {
    opacity: 0;
  }
  .fade-enter-t0 {
    opacity: 1;
  }
  .fade-leave {
    opacity: 1;
  }
  .fade-leave-to {
    opacity: 0;
  }
</style>