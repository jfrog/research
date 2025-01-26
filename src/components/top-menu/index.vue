<template>
  <ul class="top-menu flex items-center">
    <li class="menu-item">
      <g-link
          to="/model-threats/"
          class="font-bold px-3"
          style="display: none"
      >
        Model Threats
      </g-link>
      <g-link
        to="/vulnerabilities/"
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