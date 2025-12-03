<template>
  <Layout>
    <div class="latest-posts">
      <div class="container pt-5 pb-10">
        <h1 class="mt-3 pb-0">{{ $page.realTimePost.title }}</h1>
        <p class="mt-1 mb-5 green">{{ $page.realTimePost.description }} | {{ $page.realTimePost.date }}</p>

        <PostContent :content="$page.realTimePost.content"/>
      </div>
    </div>
  </Layout>
</template>
<script>
import PostContent from '~/components/post/RealTimePostContent.vue';
import BackButtonPost from "../components/BackButtonPost.vue";

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
  metaInfo() {
    const post = this.$page.realTimePost;
    const scripts = [];

    if (post.schema) {
      scripts.push({
        innerHTML: post.schema,
        type: 'application/ld+json',
        key: 'ld-json-schema'
      });
    }
    return {
      title: post.title,
      author: post.description,

      meta: [
        {name: "title", content: post.title+' | JFrog'},
        {name: "description", content: post.excerpt},
      ],
      script:scripts,
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
  .green{
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