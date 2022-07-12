<template>
  <li>
    <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-3 pb-4 mb-5 border-b-2 border-gray-400 oss-list-item"

    >
      <div class="left flex gap-3">
        <div class="left-content">
          <div class="details items-center mt-1 flex gap-2">
            <span class="title font-bold sm:leading-none">{{oss.title}}</span>
            <span class="vul-id hidden sm:block text-xs font-bold sm:hidden" v-html="oss.description"></span>

          </div>
          <div class=" text-sm mt-2">
            <span class="platform " v-html="oss.description"></span>
          </div>
          <div class="text-sm flex-col go-to-git flex gap-1 align-middle mt-1" v-if="oss.urls.length>0" >
            <div class="flex" v-for="(git, index) in oss.urls">
            <a
                :href="git.url"
                target="_blank"
                class=""
                data-gac="Outbound Link"
                :data-gaa="`${oss.title}`"
                :data-gal="`${git.url}`"
            >
             {{git.message}}
            </a>

            </div>
          </div>
          <div class="published-on flex text-xs sm:hidden gap-1 items-center sm:justify-end mt-2">
            <span class="text">Published on</span>
            <strong> {{dateString}} </strong>
            <span class="text-jfrog-green hidden sm:block">&#x25cf;</span>
          </div>
        </div>
      </div>

      <div class="right text-xs">

        <div class="published-on hidden sm:flex gap-1 items-center sm:justify-end mt-2">
          <span class="text">Published on</span>
          <strong> {{dateString}} </strong>
          <span class="text-jfrog-green hidden sm:block">&#x25cf;</span>
        </div>
      </div>

    </div>
  </li>
</template>

<script>
import {toBlogDateStr} from './../js/functions'
export default {
  name: 'ossListItem',
  props: {
    oss: {
      type: Object,
      default() {
        return {
          category: '1',
          title: '2',
          description: '3',
          date_published: new Date(),
          urls:[]
        }
      }
    },
  },

  computed: {

    dateString() {
      return toBlogDateStr(this.oss.date_published)},
    isLink() {

      const desc = this.oss.description
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
@import './../assets/style/variables';

.oss-list-item {
  max-width: 766px;
  .title{
    color: black;
  }
  .go-to-git{
    a{
      text-decoration: underline;
      font-weight: bold;
      span{
        text-decoration: none;
      }
    }

  }
  .platform {
    code {
      background-color: rgb(244, 244, 244) ;
      color: black;
    }
  }
  @media (min-width: #{$sm}) {
    .left{

      max-width: 70%;

    }
  }



}
</style>