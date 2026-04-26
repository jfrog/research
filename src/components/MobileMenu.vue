<template>
  <div class="fixed mobile-menu h-screen w-screen z-50 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 p-5 inset-0">
    <div class="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Theme</span>
        <DarkModeToggle />
      </div>
      <button
        class="ui-icon-button"
        type="button"
        aria-label="Close menu"
        @click="$emit('close')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1L11 11" stroke="currentColor" stroke-width="2"/>
          <path d="M11 1L1 11" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
    <ul class="mobile-menu-list">
      <li
        v-for="item in menuItems"
        :key="item.label"
        class="py-4 px-2 border-t border-gray-200 dark:border-gray-600"
        @click="$emit('close')"
      >
        <a
          v-if="item.external"
          :href="item.to"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-700 dark:text-gray-200"
        >
          {{item.label}}
        </a>
        <g-link
          v-else
          :to="item.to"
          class="text-gray-700 dark:text-gray-200"
        >
          {{item.label}}
        </g-link>
      </li>
    </ul>
  </div>
</template>

<script>
import DarkModeToggle from "~/components/DarkModeToggle.vue";

export default {
  components: {
    DarkModeToggle,
  },
  data() {
    return {
      menuItems: [
        {
          label: 'Home',
          to: '/',
        },
        {
          label: 'Model Threats',
          to: '/model-threats/',
        },
        {
          label: 'Discover',
          to: '/vulnerabilities/',
        },
        {
          label: 'Follow JFrog Security',
          to: 'https://twitter.com/JFrogSecurity',
          external: true,
        },
      ]
    }
  },
}
</script>

<style lang="scss">

  .mobile-menu {
    .active--exact {
      font-weight: bold;
    }
  }

</style>