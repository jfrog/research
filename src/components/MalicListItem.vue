<template>
  <li>
    <component
      :is="isLink ? 'g-link' : 'div'"
      class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-3 pb-4 mb-5 border-b-2 border-gray-400 mal-list-item"
      :to="mal.description"
      data-gac="Links back to JFrog"
      data-gaa="Malicious Packages"
      :data-gal="`${mal.title} | ${mal.description}`"
    >
      <div class="left flex gap-3">
        <div class="left-image">
          <g-image
            src="~/assets/img/icons/malicious-package.svg"
            :immediate="true"
            alt="twitter"
            width="33"
            height="33"
            class="mal-package-icon"
          />
        </div>
        <div class="left-content">
          <div class="details items-center mt-1 flex gap-2">
            <span class="title font-bold sm:leading-none">{{mal.title}}</span>
            <span class="vul-id hidden sm:block text-xs font-bold sm:hidden text-jfrog-green underline">{{mal.platform}}</span>
          </div>
          <div class="vul-id text-xs flex gap-1 mt-1">
            <span class="platform font-bold text-jfrog-green">{{mal.platform}}</span>
            <span class="bullet">&bull;</span>
            <span class="downloads_text">{{mal.downloads_text}}</span>
          </div>
          <div class="published-on flex text-xs sm:hidden gap-1 items-center sm:justify-end mt-2">
            <span class="text">Published on</span> 
            <strong> {{dateString}} </strong> 
            <span class="text-jfrog-green hidden sm:block">&#x25cf;</span>
          </div>
        </div>
      </div>
      
      <div class="right text-xs">
        <div class="go-to-blog flex items-center" v-if="isLink">
          <div class="smaller mr-1">Go To Blog</div>
          <g-image
            src="~/assets/img/icons/external-link-outline.svg"
            :immediate="true"
            alt="Go To Blog"
            width="16"
            height="16"
            class=""
          />
        </div>
        <div class="published-on hidden sm:flex gap-1 items-center sm:justify-end mt-2">
          <span class="text">Published on</span> 
          <strong> {{dateString}} </strong> 
          <span class="text-jfrog-green hidden sm:block">&#x25cf;</span>
        </div>
      </div>

    </component>
  </li>
</template>

<script>
import {toBlogDateStr} from './../js/functions'
export default {
  name: 'MalicListItem',
  props: {
    mal: {
      type: Object,
      default() {
        return {
          path: '1',
          title: '2',
          description: '3',
          date_published: new Date(),
          platform: '4',
          downloads_text: '5'
        }
      }
    },
  },
  computed: {
    dateString() {return toBlogDateStr(this.mal.date_published)},
    isLink() {
      const desc = this.mal.description
      let isLink = false
      if (typeof desc === 'string' ) {
        if (desc.length > 3) { // we can make a better check but it is not really necessary
          isLink = true
        }
      }
      return isLink
    }
  },
}
</script>

<style lang="scss">
  .mal-list-item {
    .mal-package-icon {
      min-width: 33px;
    }
  }
</style>