<template>
  <div>
    <ul
      class="block"
    >
      <component
        :is="MalicListItem"
        v-for="malicItem in malPackagesComp.slice(0,5)"
        :key="malicItem.id"
        :mal="malicItem"
      />
    </ul>


  </div>



</template>

<script>
import MalicListItem from './MalicListItem.vue'

export default {
  name: 'VulnerabilityList',
  data() {
    return {
      MalicListItem: MalicListItem,
    }
  },
  computed: {
    malPackagesComp() {
      return require('./../malicious/malicious-data.json')
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
    MalicListItem
  },
}
</script>