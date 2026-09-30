<template>
  <Layout>
    <div class="container py-10">
      <g-link class="hover:text-jfrog-green"  to="/" >
        < Back
        </g-link>
      
      <div class="flex flex-wrap gap-4 justify-between">
        <div class="left">
          <h1 class="mt-5 mb-0 pb-2"> {{title}} </h1>
          <p class="text-xs">Last Updated On <span class="font-bold"> {{latestPostDate}} </span> </p>
        </div>

      </div>

      <div class="posts pt-5 sm:pt-10">
        <ul class="block">
          <RealTimePostItem
            v-for="edge in $page.posts.edges"
            :key="edge.node.path"
            :postObj="edge.node"
          />
        </ul>
      </div>

      <div class="pagination pt-4" v-if="totalPages > 1">
        <ul class="flex gap-2 flex-wrap max-w-full">
          <li
            v-for="pageNum in totalPages"
            :key="pageNum"
          >
            <g-link
              :to="pagePath(pageNum)"
              :exact="pageNum === 1"
              :class="getPaginationClass(pageNum)"
            >
              {{pageNum}}
            </g-link>
          </li>
        </ul>
      </div>

    </div>
  </Layout>
</template>

<page-query>
query ($currentPage: Int!) {
  posts: allRealTimePost(
    sortBy: "date_sort"
    order: DESC
    page: $currentPage
    perPage: 10
    filter: { type: { eq: "realTimePost" } }
  ) {
    totalCount
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        description
        title
        date
        type
        excerpt
        tag
        img
        path
      }
    }
  }
  latest: allRealTimePost(
    sortBy: "date_sort"
    order: DESC
    limit: 1
    filter: { type: { eq: "realTimePost" } }
  ) {
    edges {
      node {
        date
      }
    }
  }
}
</page-query>

<script>
import {toBlogDateStr, getPaginationClass as getPaginationThemeClass} from '~/js/functions'
import RealTimePostItem from '~/components/RealTimePostItem.vue'

export default {
  name: 'realTimePosts',
  data() {
    return {
      title: 'JFrog Security Real Time Posts',
    }
  },
  computed: {
    currentPage() {
      return this.$page.posts.pageInfo.currentPage
    },
    totalPages() {
      return this.$page.posts.pageInfo.totalPages
    },
    latestPostDate() {
      const latest = this.$page.latest.edges[0]
      if (!latest) return ''
      return toBlogDateStr(latest.node.date)
    },
    pageTitle() {
      if (this.currentPage > 1) {
        return `${this.title} — Page ${this.currentPage}`
      }
      return this.title
    },
    canonicalPath() {
      return this.pagePath(this.currentPage)
    },
  },
  components: {
    RealTimePostItem
  },
  methods: {
    pagePath(pageNum) {
      if (pageNum === 1) return '/post/'
      return `/post/page/${pageNum}/`
    },
    getPaginationClass(pageNum) {
      return getPaginationThemeClass(this.currentPage, pageNum)
    }
  },
  metaInfo() {
    return {
      title: this.pageTitle,
      meta: [
        {
          name: "title",
          content: this.pageTitle,
        },
        {
          name: "description",
          content: `Latest security Real Time post `,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: 'https://research.jfrog.com' + this.canonicalPath,
        },
      ],
    };
  },
}
</script>

<style lang="scss">
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
</style>
