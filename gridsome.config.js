// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const tailwind = require("tailwindcss");
const postcssPlugins = [tailwind()];

module.exports = {
  siteName: "JFrog Security Research",
  siteUrl: "https://research.jfrog.com",
  plugins: [
    {
      use: "@gridsome/source-filesystem",
      options: {
        path: "vulnerabilities/**/*.md",
        typeName: "Post",
        remark: {},
      },
    },
    {
      use: "@gridsome/source-filesystem",
      options: {
        path: "model-threats/**/*.md",
        typeName: "ModelThreatsPost",
        remark: {},
      },
    },
    {
      use: "@gridsome/source-filesystem",
      options: {
        path: "post/**/*.md",
        typeName: "realTimePost",
        remark: {},
      },
    },
    {
      use: "@gridsome/plugin-sitemap",
    },
    {
      use: 'gridsome-plugin-gtm',
      options: {
        id: 'GTM-T6MF8M',
        enabled: false,
      }
    }
  ],
  transformers: {
    remark: {
      plugins: [
        [
          "remark-autolink-headings",
          {
            behavior: "wrap",
            linkProperties: {
              ariaHidden: "true",
              tabIndex: -1,
            },
          },
        ],
      ],
    },
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: postcssPlugins,
      },
    },
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  }
};
