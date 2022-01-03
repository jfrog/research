const plugin = require("tailwindcss/plugin");

module.exports = {
  purge: {
    content: [
      "./src/**/*.vue",
      "./src/**/*.js",
      "./src/**/*.jsx",
      "./src/**/*.html",
      "./src/**/*.pug",
      "./src/**/*.md",
    ],
    safelist: [
      "body",
      "html",
      "img",
      "a",
      "ol",
      "ul",
      "g-image",
      "g-image--lazy",
      "g-image--loaded",
    ],
  },
  theme: {
    fontFamily: {},
    extend: {},
  },
  variants: {},
  corePlugins: {
    container: false
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '600px',
          },
          '@screen md': {
            maxWidth: '700px',
          },
          '@screen lg': {
            maxWidth: '800px',
          },
          '@screen xl': {
            maxWidth: '1100px',
          },
        }
      })
    }
  ],
};