<template>
  <div>
    <ul
        className="block"
    >
      <component
          :is="OSSListItem"
          v-for="ossItem in ossToolJson.slice(0,5)"
          :key="ossItem.title"
          :oss="ossItem"
      />
    </ul>


  </div>


</template>



<script>
import OSSListItem from './OSSListItem.vue'

export default {
  name: 'OSSList',
  data() {
    return {
      OSSListItem: OSSListItem
    }
  },
  computed: {
    ossToolJson() {
      let list=[...require('./../oss/oss-data.json')];
      list.sort((a,b)=>new Date(b.date_published)-new Date(a.date_published))
      return list;
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
    OSSListItem
  }
}
</script>