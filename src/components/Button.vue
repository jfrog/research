<template>
  <a
    href="https://twitter.com/jfrog"
    target="_blank"
    rel="noreferrer noopener noreferrer"
    class="sr-button px-3 py-2 flex gap-2"
  >
    Follow JFrog Security
    <g-image
      src="~/assets/img/icons/twitter.svg"
      :immediate="true"
      alt="twitter"
      width="14"
      height="11"
    />
  </a>
</template>

<style lang="scss">
  @import './../assets/style/variables';
  .sr-button {
    background-color: $green;
    color: white;
    border-radius: 4px;
    transition: all 0.32s ease;
    &:hover {
      background-color: $bright-green;
    }
  }
</style>