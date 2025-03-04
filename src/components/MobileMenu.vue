<template>
  <div class="fixed mobile-menu h-screen w-screen z-50 bg-white text-gray-700 p-5 inset-0">
    <div class="flex justify-end mb-3">
      <button class="p-3" @click="$emit('close')">
        <g-image
          src="~/assets/img/buttons/close.svg"
          alt="Menu"
        />
      </button>
    </div>
    <ul class="mobile-menu-list">
      <li
        v-for="item in menuItems"
        :key="item.label"
        class="py-4 px-2 border-t border-gray-200"
        @click="$emit('close')"
      >
        <g-link
          :to="item.to"
          class="text-gray-700"
        >
          {{item.label}}
        </g-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
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