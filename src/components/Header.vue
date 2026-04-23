<template>
  <header class="py-2 main-header dark:bg-gray-900">
    <div class="container mx-auto px-2">
      <div class="flex w-full justify-between items-center">
        <div class="left flex-1 min-w-0">
          <div class="flex min-w-0 items-center gap-2">
            <JFrogLogo />
            <span class="site-name small truncate dark:text-gray-200">{{ $static.metadata.siteName }}</span>
          </div>
        </div>
        <div class="right flex-shrink-0">
          <div class="hidden sm:block desktop-menu-wrapper">
            <TopMenu />
          </div>
          <div class="sm:hidden flex mobile-menu-wrapper items-center">
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
              class="show-menu-hamburger ui-icon-button"
              type="button"
              aria-label="Open menu"
              aria-haspopup="dialog"
              :aria-expanded="isShowMobileMenu ? 'true' : 'false'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="16"
                viewBox="0 0 22 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M0 1C0 0.447715 0.447715 0 1 0H21C21.5523 0 22 0.447715 22 1C22 1.55228 21.5523 2 21 2H1C0.447716 2 0 1.55228 0 1Z" fill="currentColor"/>
                <path d="M0 8C0 7.44772 0.447715 7 1 7H21C21.5523 7 22 7.44772 22 8C22 8.55228 21.5523 9 21 9H1C0.447716 9 0 8.55228 0 8Z" fill="currentColor"/>
                <path d="M0 15C0 14.4477 0.447715 14 1 14H21C21.5523 14 22 14.4477 22 15C22 15.5523 21.5523 16 21 16H1C0.447716 16 0 15.5523 0 15Z" fill="currentColor"/>
              </svg>
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
    MobileMenu,
  }
}
</script>

<style lang="scss">
  @import './../assets/style/variables';
  .main-header {
    border-bottom: 1px solid $border-gray;
  }
  html.dark .main-header {
    border-bottom-color: #475569;
  }
  .site-name {
    max-width: 11rem;
  }
  @media (min-width: #{$sm}) {
    .site-name {
      max-width: none;
    }
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