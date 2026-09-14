<template>
  <Layout>
    <div class="latest-posts">
      <div class="container pt-5 pb-10">
        <h1 class="mt-3 pb-0">{{ $page.realTimePost.title }}</h1>
        <p class="mt-1 mb-5 green">{{ $page.realTimePost.description }} | {{ formattedDate }}</p>

        <PostContent :content="$page.realTimePost.content"/>
      </div>
    </div>
  </Layout>
</template>
<script>
import PostContent from '~/components/post/RealTimePostContent.vue';
import BackButtonPost from "../components/BackButtonPost.vue";
import { toBlogDateStr } from '~/js/functions';
import { buildTechArticleSchema, parseExtraSchema } from '~/js/techArticleSchema';

export default {
  name: "RealTimePost",
  components: {
    BackButtonPost,
    PostContent,

  },
  data() {

    return {
      referrer: 'ss',
    };
  },
  computed: {
    formattedDate() {
      return this.$page?.realTimePost?.date ? toBlogDateStr(this.$page.realTimePost.date) : '';
    },
  },
  metaInfo() {
    const post = this.$page.realTimePost;
    const baseUrl = this.$static.metadata.baseURL;
    const scripts = [];
    const links = []
    const techArticle = buildTechArticleSchema(post, baseUrl);
    const extraSchema = parseExtraSchema(post.schema);

    if (techArticle) {
      scripts.push({
        type: 'application/ld+json',
        json: techArticle,
        key: 'ld-json-tech-article',
      });
    }
    if (extraSchema) {
      scripts.push({
        type: 'application/ld+json',
        json: extraSchema,
        key: 'ld-json-schema',
      });
    }
    if (post.canonical) {
      links.push({
        rel: "canonical",
        href: post.canonical,
      });
    }
    return {
      title: post.title,
      author: post.description,

      meta: [
        {name: "title", content: post.title + ' | JFrog'},
        {name: "description", content: post.excerpt},
      ],
      link: links,
      script: scripts,
    };
  },

  methods: {},

};
</script>

<page-query>
query realTimePost($id: ID!) {
realTimePost(id: $id) {
description
title
date
type
tag
img
path
content
excerpt
minutes
schema
canonical
}
}
</page-query>

<static-query>
query {
metadata {
baseURL
}
}
</static-query>

<style lang="scss">
@import './../assets/style/variables';

.latest-posts {
  background: #F8F9F9;
  padding: 40px 0;

  .green {
    color: #40be46;
  }

  .container {
    min-height: 71vh;

    padding: 40px 50px;
    background-color: white;
    border-radius: 20px;

    h1 {
      font-size: 33px;
      font-weight: 500;
      line-height: 1.3;
      @media (max-width: #{$md}) {
        font-size: 20px;

      }
    }

    @media (max-width: #{$md}) {
      padding: 40px 30px;
      max-width: 90vw;
    }
  }

}

</style>