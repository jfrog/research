// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const axios = require('axios')

module.exports = function(api) {
  api.loadSource(
    async (store) => {
      store.addMetadata("baseURL", "https://research.jfrog.com");

      const domain = 'jfrog.local' 

      //for resting purposes on dev only
      // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      
      const {data} = await axios.get(`https://jfrog.info/latest-security-posts`)

      store.addMetadata("latestPostsJSON", JSON.stringify(data))

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
        }
      `)
    }
  );

  // api.createPages(({ createPage }) => {
  //   // Use the Pages API here: https://gridsome.org/docs/pages-api/
  // })
};