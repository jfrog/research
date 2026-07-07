// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const tailwind = require("tailwindcss");
const postcssPlugins = [tailwind()];

// RSS/XML 1.0 only allows tab, LF, and CR as control chars; strip others and
// escape CDATA terminators so feed validators do not fail on post content.
function sanitizeForRss(text) {
  if (!text) return text;
  return String(text)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\]\]>/g, "]]]]><![CDATA[>");
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
    {
      use: "gridsome-plugin-feed",
      options: {
        contentTypes: ["realTimePost", "Post"],
        feedOptions: {
          title: "JFrog Security Research",
          description:
            "Latest security research, real-time threat posts, and vulnerability disclosures from JFrog Security Research.",
          link: "https://research.jfrog.com/",
          language: "en",
        },
        rss: {
          enabled: true,
          output: "/rss.xml",
        },
        maxItems: 50,
        htmlFields: ["content", "description", "excerpt"],
        filterNodes: (node) =>
          node.type === "realTimePost" || node.type === "vulnerability",
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
    },
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
