<template>
  <g-link
    :to="'/'"
    class="logo"
  >
    <g-image
      height="42"
      src="~/assets/img/jfrog-logo-svg.svg"
      width="40"
      :immediate="true"
      :alt="$static.metadata.siteName"
    />
  </g-link>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
export default {
  name: "JFrogLogo",
}
</script>

