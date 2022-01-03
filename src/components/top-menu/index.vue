<template>
  <ul class="top-menu flex items-center">
    <li class="menu-item">
      <g-link
        to="/discover"
        class="font-bold px-3 mx-3"
      >
        Discover
      </g-link>
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
export default {
  name: "TopMenu",
  components: {
    Button
  }
}
</script>

<style lang="scss">
  .top-menu {
    > .menu-item {

    }
  }
</style>

