const plugin = require("tailwindcss/plugin");

module.exports = {
  purge: {
    content: [
      "./src/**/*.vue",
      "./src/**/*.js",
      // "./src/**/*.jsx",
      // "./src/**/*.html",
      // "./src/**/*.pug",
      // "./src/**/*.md",
    ],
    safelist: [
      // "body",
      // "html",
      // "img",
      // "a",
      // "ol",
      // "ul",
      "g-image",
      "g-image--lazy",
      "g-image--loaded",
      "bg-gray-700",
      "bg-yellow-300",
      "bg-yellow-500",
      "bg-red-500",
      "bg-red-700",
      "bg-gray-200"
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
    extend: {
      display: ['first']
    }
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
