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
    extend: {
      colors: {
        'jfrog-green': '#40BE46',
      },
      aspectRatio: {
        'blog-image': '1.65',
      },

    },
  },
  variants: {
    // borderWidth: ['last']
  },
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
            maxWidth: '1000px',
          },
          '@screen xl': {
            maxWidth: '1115px',
          },
        }
      })
    }
  ],
};
