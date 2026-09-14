<template>
  <footer class="py-4 main-footer bg-black dark:bg-gray-950">
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
                :target="item.target"
                :class="'text-white' + item.class"
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
  metaInfo() {
    return {
      script: [
        {
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': 'https://jfrog.com/#organization',
            name: 'JFrog',
            legalName: 'JFrog Ltd.',
            url: 'https://jfrog.com/',
            logo: {
              '@type': 'ImageObject',
              url: 'https://research.jfrog.com/assets/static/jfrog-logo-svg.5788598.74a3bea875bf053c65a0663c9ec9a0fd.svg',
            },
          },
        },
      ],
    };
  },
  data() {
    return {
      menuItems: [
        {
          label: 'Terms of Use',
          to: 'https://jfrog.com/terms-of-use/',
          class:'',
          target:'_blank'
        },
        {
          label: 'Cookies Policy',
          to: 'https://jfrog.com/jfrog-cookies-policy/',
          class:'',
          target:'_blank'

        },
        {
          label: 'Privacy Policy',
          to: 'https://jfrog.com/privacy-policy/',
          class:'',
          target:'_blank'


        },
        {
          label: 'Cookies Settings',
          to: '#',
          class:' ot-sdk-show-settings',
          target:'_self'

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