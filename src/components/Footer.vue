<template>
  <footer class="py-4 main-footer bg-black">
    <div class="container mx-auto px-2">
      <div class="flex w-full justify-center flex-col sm:flex-row sm:justify-between items-center flex-wrap gap-4">
        <div class="left">
          <div class="flex items-center gap-2">
            <JFrogLogo />
          </div>
        </div>
        <div class="right">
          <ul class="footer-menu flex flex-col sm:flex-row items-center">
            <li
              v-for="item in menuItems"
              :key="item.label"
              class="px-4 py-1 sm:border-r"
            >
              <a
                :href="item.to"
                rel="noopener noreferrer"
                target="_blank"
                class="text-white"
              >
                {{item.label}}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p class="sm:hidden text-center text-white pt-3">
        ©{{new Date().getFullYear() }} All Rights Reserved. JFrog Ltd.
      </p>
    </div>
  </footer>
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
  data() {
    return {
      menuItems: [
        {
          label: 'Terms of Use',
          to: 'https://jfrog.com/terms-of-use/'
        },
        {
          label: 'Cookies Policy',
          to: 'https://jfrog.com/jfrog-cookies-policy/'
        },
        {
          label: 'Privacy Policy',
          to: 'https://jfrog.com/privacy-policy/'
        },
      ]
    }
  },
  components: {
    JFrogLogo,
    TopMenu
  }
}
</script>

<style lang="scss">
  @import './../assets/style/variables';
  .main-footer {
    ul.footer-menu {
      li {
        &:last-child {
          border: none;
        }
      }
    }
  }
</style>