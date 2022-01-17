<template>
  <div>
    <ul
      class="block"
    >
      <component
        :is="MalicListItem"
        v-for="malicItem in malicArray.slice(0,5)"
        :key="malicItem.id"
        :mal="malicItem"
      />
    </ul>


  </div>



</template>

<script>
import MalicListItem from './MalicListItem.vue'

import malicJSON from '~/malicious/malicious-data.json'

import {malPackages} from '~/malicious/malicious-packages.js'

export default {
  name: 'VulnerabilityList',
  data() {
    return {
      MalicListItem: MalicListItem,
      malicListJSON: malicJSON,
      malicArray: malPackages
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
  }
}
</script>