<template>
  <Layout>
    <h1 class="text-4xl bold underline pb-4">Hello, world!</h1>

    <p class="text-2xl">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur
      excepturi labore tempore expedita, et iste tenetur suscipit explicabo!
      Dolores, aperiam non officia eos quod asperiores
    </p>

    <hr class="mx-8 my-4" />
    <h2 class="text-2xl text-center">Find me online:</h2>
    <hr class="mx-8 my-4" />

    <h2 class="text-2xl text-center">My Blog Posts:</h2>
    <div
      class="lg:grid lg:grid-flow-row lg:grid-cols-2 lg:gap-8 lg:auto-rows-auto"
    >
      <div
        v-for="(edge, index) in $page.posts.edges"
        :key="edge.node.id"
        class="prose lg:prose-xl xl:prose-2xl lg:flex lg:flex-col lg:pr-20"
      >
        <a :href="edge.node.path">
          <h2>
            {{ edge.node.title }}
          </h2>
        </a>
        <p class="lg:flex-grow lg:justify-self-start">
          {{ edge.node.description }}
        </p>
        <hr class="mx-8" />
      </div>
    </div>
  </Layout>
</template>

<page-query>
query Blog {
  posts: allPost (sortBy: "date_published", order: DESC, filter: { published: {eq: true }}){
    edges {
      node {
        id
        title
        description
        tags
        path
        date_published
        timeToRead
      }
    }
  }
}
</page-query>

<script>
export default {
  metaInfo: {
    title: "Security Research",
    meta: [
      {
        name: "description",
        content: "Cutting Edge Security Research to Protect the Modern Software Supply Chain",
      },
    ],
  },
};
</script>
