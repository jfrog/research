<template>
  <Layout>
    <div class="container mt-posts pt-5 pb-10">
      <g-link class="hover:text-jfrog-green transition-all" to="/model-threats/">
        < Back
      </g-link>
      <div class="mt-posts-details">
        <div class="title" id="main-title">{{ $page.modelThreatsPost.title }}</div>
        <div class="description mb-3">{{ $page.modelThreatsPost.description }}</div>
      </div>
      <div class="mt-posts-content">
        <PostContentMenu :content="$page.modelThreatsPost.content"/>
        <PostContent :content="$page.modelThreatsPost.content"/>
      </div>
    </div>
  </Layout>
</template>

<script>
import PostContent from '~/components/post/ModelThreatsPostContent.vue';
import PostContentMenu from '~/components/post/ModelThreatsPostContentMenu.vue';

export default {
  name: "ModelThreatsPost",
  components: {
    PostContent,
    PostContentMenu,
  },
  metaInfo() {
    const post = this.$page.modelThreatsPost;
    return {
      title: post.title,
      meta: [
        {name: "title", content: post.title},
        {name: "description", content: post.description},
      ],
    };
  },
};
</script>

<page-query>
query modelThreatsPost($id: ID!) {
modelThreatsPost(id: $id) {
title
path
content
description
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
@import '~/assets/style/variables';

.mt-posts-details {
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  color: black;
  width: 100%;
  border-bottom: 1px solid black;
  @media (max-width: #{$sm}) {

    max-width: 100%;
  }
  .title {
    font-size: 36px;
    font-weight: bold;
  }

  .description {
    font-size: 16px;
    font-weight: normal;
  }
}

.mt-posts-content {
  display: grid;
  grid-template-columns: 187px 1fr;
  gap: 42px;
  position: relative;
  @media (max-width: #{$sm}) {
    display: flex;
    max-width: 100%;
  }

}
</style>