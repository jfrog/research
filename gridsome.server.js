// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const axios = require('axios')
const webp = require('webp-converter');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { Feed } = require('feed');
const {
  sanitizeForRss,
  parseFeedDate,
  absoluteUrl,
} = require('./gridsome-rss-utils');

let latestSecurityBlogPosts = [];
webp.grant_permission();

// get remote blog images and convert them to webp
async function convertRemoteBlogImages() {

  //get data from jfrog.com
  const {data} = await axios.get(`https://jfrog.com/latest-security-posts/`)

  parsedPosts = [...data]

  const imageUrls = []
  
  for (let i = 0; i < parsedPosts.length; i++) {
    
    const post = parsedPosts[i];
    const remoteURL = post.img

    //get remote file
    const response = await fetch(remoteURL);
    const buffer = await response.buffer();  

    //image extension
    const fileStrSplit = remoteURL.split('.')
    const ext = fileStrSplit[fileStrSplit.length-1]

    //write normal file locally, and add a converted webp version
    fs.writeFile(`./static/latest-posts-${i}.${ext}`, buffer, () => {
      console.log(`finished downloading ${remoteURL} ! | Saved to ./static/latest-posts-${i}.${ext} `)
      const result = webp.cwebp(
        `./static/latest-posts-${i}.${ext}`,
        `./static/latest-posts-${i}.webp`,
        "-q 80",
        logging="-v"
      );
      result.then((response) => {
        console.log(response);
      });
    });
  }

}



convertRemoteBlogImages()

module.exports = function(api) {
  api.loadSource(
    async (store) => {
      store.addMetadata("baseURL", "https://research.jfrog.com");

      const domain = 'jfrog.local' 

      //for resting purposes on dev only
      // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      
      const {data} = await axios.get(`https://jfrog.com/latest-security-posts`)
      const CVEPost = await axios.get(`https://jfrog.com/latest-cve-posts`)
      const Log4shellPost = await axios.get(`https://jfrog.com/latest-log4shell-posts`)
      const springShellPost = await axios.get(`https://jfrog.com/latest-springshell-posts`)
        const NpmToolsPost = await axios.get(`https://jfrog.com/latest-npmtools-posts`)

        const post = data.map((post,imageIndex)=>{
            post.img='/latest-posts-'+imageIndex+'.webp';
            return post;
        })
      latestSecurityBlogPosts = post;
      store.addMetadata("latestPostsJSON", JSON.stringify(post))
      store.addMetadata("latestCVEPostsJSON", JSON.stringify(CVEPost.data))
      store.addMetadata("latestLog4ShellPostsJSON", JSON.stringify(Log4shellPost.data))
      store.addMetadata("latestSpringShellPostsJSON", JSON.stringify(springShellPost.data))
        store.addMetadata("latestNpmToolsPostsJSON", JSON.stringify(NpmToolsPost.data))

    },
    ({ addSchemaTypes }) => {
      addSchemaTypes(`
        type Post implements Node {
          id: ID!
          title: String
          published: Boolean
          description: String
          date_published: Date
          last_updated: Date
          xray_id: String
          vul_id: String
          severity: String
          discovered_by: String
          type: String
          platform: String
          downloads_text: String
          cvss: String
          tag: String
          img: String
          excerpt: String
          minutes: String
          date: Date,
          schema: String
          canonical:String
          published_on_hp:Boolean


        }
      `)
    }
  );

  api.afterBuild(({ config }) => {
    const siteUrl = config.siteUrl;
    if (!siteUrl) return;

    const store = api.store;
    const postCollection = store.getCollection('Post');
    const realTimeCollection = store.getCollection('realTimePost');
    const posts = (postCollection && postCollection.collection && postCollection.collection.data) || [];
    const realTimePosts = (realTimeCollection && realTimeCollection.collection && realTimeCollection.collection.data) || [];

    const vulnerabilityItems = posts
      .filter((node) => node.type === 'vulnerability')
      .sort((a, b) => parseFeedDate(b.date_published) - parseFeedDate(a.date_published))
      .slice(0, 4)
      .map((node) => ({
        title: sanitizeForRss(node.title),
        date: parseFeedDate(node.date_published),
        link: absoluteUrl(siteUrl, node.path),
        description: sanitizeForRss(node.description),
        content: sanitizeForRss(node.content),
        author: [{ name: sanitizeForRss(node.discovered_by || 'JFrog Security Research') }],
      }));

    const localRealTimePosts = realTimePosts.filter(
      (node) => node.type === 'realTimePost' && node.published_on_hp !== false
    );

    const latestFromBlogItems = [...latestSecurityBlogPosts, ...localRealTimePosts]
      .sort((a, b) => parseFeedDate(b.date) - parseFeedDate(a.date))
      .slice(0, 5)
      .map((node) => {
        if (node.path) {
          return {
            title: sanitizeForRss(node.title),
            date: parseFeedDate(node.date),
            link: absoluteUrl(siteUrl, node.path),
            description: sanitizeForRss(node.excerpt || node.description),
            content: sanitizeForRss(node.content),
            author: [{ name: sanitizeForRss(node.description || 'JFrog Security Research') }],
          };
        }

        return {
          title: sanitizeForRss(node.title),
          date: parseFeedDate(node.date),
          link: node.href,
          description: sanitizeForRss(node.excerpt || node.description),
          content: sanitizeForRss(node.excerpt || node.description),
          author: [{ name: 'JFrog Security Research' }],
        };
      });

    const feedItems = [...vulnerabilityItems, ...latestFromBlogItems].sort(
      (a, b) => b.date - a.date
    );

    const feed = new Feed({
      title: 'JFrog Security Research',
      description:
        'Homepage feed: latest vulnerabilities and security research posts from JFrog Security Research.',
      link: siteUrl,
      id: siteUrl,
      language: 'en',
      generator: 'Gridsome Home RSS',
      feedLinks: {
        rss: absoluteUrl(siteUrl, '/rss.xml'),
      },
    });

    feedItems.forEach((item) => {
      feed.addItem({
        ...item,
        id: item.link,
      });
    });

    const outDir = config.outputDir || config.outDir || './dist';
    const outputPath = path.join(outDir, 'rss.xml');
    fs.writeFileSync(outputPath, feed.rss2());
    console.log('Generate RSS feed at /rss.xml');
  });

  // api.createPages(({ createPage }) => {
  //   // Use the Pages API here: https://gridsome.org/docs/pages-api/
  // })
};