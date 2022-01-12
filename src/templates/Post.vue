<template>
  <Layout>
    <div class="container py-10">
      
      <BackButton />

      <PostHero :vul="$page.post" />
      
      <PostContent :content="$page.post.content" />

    </div>
  </Layout>
</template>

<script>
import BackButton from '~/components/BackButton'
import PostHero from '~/components/post/PostHero'
import PostContent from '~/components/post/PostContent'

export default {
  name: "Post",
  metaInfo() {
    return {
      title: this.$page.post.title,
      meta: [
        {
          name: "description",
          content: this.$page.post.description,
        },
        {
          name: "twitter:description",
          content: this.$page.post.description,
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: this.$page.post.title,
        },
        {
          name: "twitter:creator",
          content: "@terabytetiger",
        },
        {
          name: "twitter:site",
          content: "@terabytetiger",
        },
        {
          name: "og:description",
          content: this.$page.post.description,
        },
        {
          name: "og:title",
          content: this.$page.post.title,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: this.$static.metadata.baseURL + this.$page.post.path,
        },
      ],
    };
  },
  mounted() {
    console.log(this.$page)
  },
  components: {
    BackButton,
    PostHero,
    PostContent
  }
};
</script>

<page-query>
query Post($id: ID!) {
  post(id: $id) {
    title
    path
    content
    description
    date_published
    xray_id
    vul_id
    severity
    discovered_by
    last_updated
    cvss
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
