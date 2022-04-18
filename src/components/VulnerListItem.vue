<template>
  <li>
    <a
      class="flex cursor-pointer flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-3 pb-4 mb-4 border-b-2 border-gray-400"
      data-gac="CTA Links"
      :data-gaa="vul.title"
      :data-gal="vul.path"
      :href="vul.path"

    >
      <div class="left">
        <div class="xray-id text-sm">{{vul.xray_id}}</div>
        <div class="details items-center mt-1 flex gap-2">
          <span class="title font-bold">{{vul.title}}</span>
          <span :class="`badge hidden sm:block font-bold flex items-center justify-center bg-${severityColorVal} px-2 py-1 uppercase text-white`">{{vul.severity}}</span>
          <span class="vul-id hidden sm:block text-xs font-bold sm:hidden text-jfrog-green underline">{{vul.vul_id}}</span>
        </div>
        <a
            :href="vul.path"
            class="vul-id text-xs font-bold mt-1 hidden sm:block text-jfrog-green underline"
          data-gac="CTA Links"
          :data-gaa="vul.title"
          :data-gal="`${vul.vul_id} | ${vul.path}`"
        >
          {{vul.vul_id}}
        </a>
      </div>

      <div class="sm:hidden 123 flex gap-3 items-center">
        <div class="vul-id text-xs font-bold mt-1 text-jfrog-green underline">{{vul.vul_id}}</div>
        <span :class="`badge font-bold flex items-center justify-center bg-${severityColorVal} px-2 py-1 uppercase text-white`">{{vul.severity}}</span>
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
    </a>
  </li>
</template>

<script>
import {toBlogDateStr, severityColor} from '~/js/functions'
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
    severityColorVal() {
      const s = this.vul.severity
      return severityColor(s)
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