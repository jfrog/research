<template>
  <button
    type="button"
    class="theme-toggle ui-icon-button"
    :aria-pressed="isDark ? 'true' : 'false'"
    aria-label="Toggle dark mode"
    title="Toggle dark mode"
    @click="toggle"
  >
    <svg
      v-if="!isDark"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  </button>
</template>

<script>
import { themeState, themeMutations } from "~/theme.js";

export default {
  name: "DarkModeToggle",
  computed: {
    isDark() {
      return themeState.isDark;
    }
  },
  methods: {
    toggle() {
      themeMutations.toggle();
    },
  },
};
</script>
