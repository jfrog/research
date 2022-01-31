<template>
  <section class="single-post-hero mt-3 py-5 sm:py-8 px-4 sm:px-10 bg-gray-100 text-black">
    
    <h1>{{vul.xray_id}} - {{vul.title}}</h1>
    
    <p class="text-jfrog-green font-bold"> 
      {{vul.vul_id}}
      <span class="cvss" v-if="vul.cvss">
        | CVSS {{vul.cvss}}
      </span>
    </p> 
    
    <p class="severity mt-1 flex gap-2 items-center">
      <span :class="severityDotClass"></span> JFrog Severity:<span class="capitalize">{{vul.severity}}</span>
    </p>

    <p class="dates font-bold text-sm mt-4">
      Published {{ datePublishString }} | Last updated {{ dateUpdateString }}
    </p>

  </section>
</template>

<script>
import {toBlogDateStr, severityColor} from '~/js/functions'
  export default {
    name: 'PostHero',
    props: {
      vul: {
        type: Object,
        default() {
          return {
            path: '-path-',
            title: '-title-',
            description: '-description-',
            date_published: new Date(),
            xray_id: '-xray_id-',
            vul_id: '-vul_id-',
            severity: '-severity-',
            discovered_by: '-discovered_by-',
            last_updated: new Date() ,
            cvss: '-cvss-'
          }
        }
      },
    },
    computed: {
      severityColorVal() {
        return severityColor(this.vul.severity)
      },
      datePublishString() {
        return toBlogDateStr(this.vul.date_published)
      },
      dateUpdateString() {
        return toBlogDateStr(this.vul.last_updated)
      },
      severityDotClass() {
        return 'inline-block rounded-full w-4 h-4 bg-'+this.severityColorVal
      }
    }
  }
</script>