<template>
  <div>
    <ul
      class="block"
    >
      <component
        :is="vulComponent"
        v-for="(edge, index) in $static.posts.edges"
        :key="edge.node.id"
        :vul="edge.node"
      />
    </ul>


  </div>



</template>

<static-query>
query Blog {
  posts: allPost (
    sortBy: "date_published",
    order: DESC
  ){
    edges {
      node {
        id
        path
        title
        description
        date_published
        xray_id 
        vul_id
        severity
        discovered_by
      }
    }
  }
}
</static-query>

<script>
import VulnerListItem from './VulnerListItem.vue'
export default {
  name: 'VulnerabilityList',
  data() {
    return {
      vulComponent: VulnerListItem
    }
  },
  metaInfo: {
    title: "Security Research",
    meta: [
      {
        name: "description",
        content: "Cutting Edge Security Research to Protect the Modern Software Supply Chain",
      },
    ],
  },
  components: {
    VulnerListItem
  }
}
</script>