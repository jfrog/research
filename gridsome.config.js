// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const tailwind = require("tailwindcss");
const postcssPlugins = [tailwind()];
const { sanitizeForRss } = require("./gridsome-rss-utils");

function createFeedPlugin({
  contentTypes,
  output,
  title,
  description,
  filterNodes,
}) {
  return {
    use: "gridsome-plugin-feed",
    options: {
      contentTypes,
      feedOptions: {
        title,
        description,
        link: "https://research.jfrog.com/",
        language: "en",
      },
      rss: {
        enabled: true,
        output,
      },
      maxItems: 50,
      htmlFields: ["content", "description", "excerpt"],
      filterNodes,
      nodeToFeedItem: (node) => {
        const rawDate = node.date_published || node.date;
        const date =
          rawDate instanceof Date ? rawDate : new Date(rawDate);
        return {
          title: sanitizeForRss(node.title),
          date: isNaN(date.getTime()) ? new Date(0) : date,
          description: sanitizeForRss(node.excerpt || node.description),
          content: sanitizeForRss(node.content),
          author: [
            {
              name: sanitizeForRss(
                node.discovered_by ||
                  node.description ||
                  "JFrog Security Research"
              ),
            },
          ],
        };
      },
    },
  };
}

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
    createFeedPlugin({
      contentTypes: ["realTimePost"],
      output: "/post/rss.xml",
      title: "JFrog Security Real Time Posts",
      description: "Latest security real-time threat posts from JFrog Security Research.",
      filterNodes: (node) => node.type === "realTimePost",
    }),
    createFeedPlugin({
      contentTypes: ["Post"],
      output: "/vulnerabilities/rss.xml",
      title: "JFrog Security Vulnerabilities",
      description:
        "Latest vulnerability disclosures discovered by JFrog Security Research.",
      filterNodes: (node) => node.type === "vulnerability",
    }),
    {
      use: 'gridsome-plugin-gtm',
      options: {
        id: 'GTM-T6MF8M',
        enabled: true,
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
