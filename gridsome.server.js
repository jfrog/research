// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const axios = require('axios')
const webp = require('webp-converter');
const fs = require('fs');
const fetch = require('node-fetch');
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


        }
      `)
    }
  );

  // api.createPages(({ createPage }) => {
  //   // Use the Pages API here: https://gridsome.org/docs/pages-api/
  // })
};