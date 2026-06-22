<template>
  <li>
    <g-link
      class="flex cursor-pointer flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-3 pb-4 mb-4 border-b-2 border-gray-400 dark:border-gray-600"
      data-gac="CTA Links"
      :data-gaa="vul.title"
      :data-gal="vul.path"
      :to="vul.path"

    >
      <div class="left">
        <div class="xray-id text-sm">{{vul.xray_id}}</div>
        <div class="details items-center mt-1 flex gap-2">
          <span class="title font-bold text-black dark:text-gray-100">{{vul.title}}</span>
          <span :class="[severityBadgeClass, 'hidden sm:flex']">{{vul.severity}}</span>
          <span class="vul-id hidden sm:block text-xs font-bold sm:hidden text-jfrog-green underline">{{vul.vul_id}}</span>
        </div>
        <div
            class="vul-id text-xs font-bold mt-1 hidden sm:block text-jfrog-green underline"
          data-gac="CTA Links"
          :data-gaa="vul.title"
          :data-gal="`${vul.vul_id} | ${vul.path}`"
        >
          {{vul.vul_id}}
        </div>
      </div>

      <div class="sm:hidden 123 flex gap-3 items-center">
        <div class="vul-id text-xs font-bold mt-1 text-jfrog-green underline">{{vul.vul_id}}</div>
        <span :class="[severityBadgeClass, 'sm:hidden']">{{vul.severity}}</span>
      </div>
      
      <div class="right text-xs">
        <div class="discovered-by flex gap-1 items-center sm:justify-end">
          <span class="text">Discovered By</span> 
          <strong>{{vul.discovered_by}}</strong> 
          <span class="text-jfrog-green hidden sm:block">&#x25cf;</span>
        </div>
        <div class="published-on flex gap-1 items-center sm:justify-end mt-2">
          <span class="text">Published on</span> 
          <strong> {{dateString}} </strong> 
          <span class="text-jfrog-green hidden sm:block">&#x25cf;</span>
        </div>
      </div>
    </g-link>
  </li>
</template>

<script>
import {toBlogDateStr} from '~/js/functions'
export default {
  name: 'VulnerListItem',
  props: {
    vul: {
      type: Object,
      default() {
        return {
          path: '1',
          title: '2',
          description: '3',
          date_published: new Date(),
          xray_id : '5',
          vul_id: '6',
          severity: '7',
          discovered_by: '8',
        }
      }
    },
  },
  data() {
    return {
      // url: `https://nvd.nist.gov/vuln/detail/${this.vul.vul_id}`
      url: this.vul.path
    }
  },
  computed: {
    severityBadgeClass() {
      const baseClass = 'badge font-bold flex items-center justify-center px-2 py-1 uppercase'

      switch ((this.vul.severity || '').toLowerCase()) {
        case 'low':
          return `${baseClass} bg-yellow-300 text-gray-900`
        case 'medium':
          return `${baseClass} bg-yellow-500 text-gray-900`
        case 'high':
          return `${baseClass} bg-red-700 text-white`
        case 'critical':
          return `${baseClass} bg-red-800 text-white`
        default:
          return `${baseClass} bg-gray-300 text-gray-900 dark:bg-gray-500 dark:text-white`
      }
    },
    dateString() {
      return toBlogDateStr(this.vul.date_published)
    }, 
  },
  methods: {
    goToVulURL() {
      // const url = `https://nvd.nist.gov/vuln/detail/${this.vul.vul_id}`
      // window.open(this.url, '_blank').focus();
    },
    // handleSingleVulItemClick(event) {
    //   const t = event.target
    //   if (t.classList.contains('vul-id')) {
    //     // this.goToVulURL()
    //   } else {
    //     this.$router.push({ path: this.vul.path })
    //   }
    // }
  }
}
</script>

<style lang="scss">
  .badge {
    font-style: normal;
    font-weight: bold;
    font-size: 8px;
    line-height: 9px;
    text-align: center;
    letter-spacing: 0.2em;
    line-height: 1;
    width: 74px;
    height: 16px;
    border-radius: 10px;
  }
</style>