<template>
  <ul class="top-menu flex items-center">
    <li class="menu-item">
      <g-link
          to="/model-threats/"
          class="font-bold px-3 dark:text-gray-200"
      >
        Model Threats
      </g-link>
      <g-link
        to="/vulnerabilities/"
        class="font-bold px-3 mx-3 dark:text-gray-200"
      >
        Discover
      </g-link>
    </li>
    <li class="flex items-center mr-2">
      <DarkModeToggle />
    </li>
    <li>
      <Button />
    </li>
  </ul>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
import Button from './../Button'
import DarkModeToggle from '~/components/DarkModeToggle.vue'
export default {
  name: "TopMenu",
  components: {
    Button,
    DarkModeToggle,
  }
}
</script>