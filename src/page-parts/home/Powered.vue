<template>
  <section class="powered relative text-center bg-jfrog-green py-14">
    <g-image
      class="absolute z-10 inset-x-0 mx-auto top-0 splash"
      src="~/assets/img/home-page/splash.svg"
      alt="Powered By jfrog.com"
    />
    <div class="container">
      <h2 class="uppercase text-white font-extrabold p-0">
        <a
          href="https://jfrog.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Powered By <br class="sm:hidden"> jfrog.com
        </a>
      </h2>
    </div>
  </section>
</template>

<style lang="scss">
  section.powered {
    .splash {
      transform: translateY(-99%);
    }
  }
</style>