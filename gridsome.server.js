// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = function(api) {
  api.loadSource(
    async (store) => {
      store.addMetadata("baseURL", "https://research.jfrog.com");
    },
    ({ addSchemaTypes }) => {
      addSchemaTypes(`
        type Post implements Node {
          id: ID!
          title: String
          published: Boolean
          description: String
          date_published: Date
          xray_id: String
          vul_id: String
          severity: String
          discovered_by: String
          type: String
          platform: String
          downloads_text: String
        }
      `)
    }
  );

  api.createPages(({ createPage }) => {
    // Use the Pages API here: https://gridsome.org/docs/pages-api/
  });
};
