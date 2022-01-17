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

/**
 * 
 * 

meta data example:

title         : vul-1 Remote code execution in Ansible
published     : true
description   : This is a sample blog post. It includes a variety of example points to show what your articles will look like out of the box.
date_published: "2021-11-23"
xray_id       : sXRAY-10001
vul_id        : CVE-2021-12345
severity      : critical
discovered_by : Ori Hollander
og_image      : ./og/ogImage.png
type          : vulnerability
 */

import BackButton from '~/components/BackButton'
import PostHero from '~/components/post/PostHero'
import PostContent from '~/components/post/PostContent'

export default {
  name: "Post",
  data() {
    return {
      // p: this.$page.post,
      // t: this.$page.post.title,
    }
  },
  computed: {
    severityCapital() {
      let s = this.$page.post.severity
      return s.charAt(0).toUpperCase() + s.slice(1)
    }
  },
  metaInfo() {
    return {
      title: `${this.$page.post.title} | ${this.$page.post.xray_id} | JFrog`,
      meta: [
        {
          name: "description",
          content: `${this.$page.post.vul_id} ${this.severityCapital} severity. ${this.$page.post.description} `,
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
