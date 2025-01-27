<template>
  <div class="mt-list-cube">
    <g-link
        class="mt-list-item cursor-pointer"
        data-gac="CTA Links"
        :data-gaa="vul.title"
        :data-gal="vul.path"
        :to="vul.path"
    >
      <div class="title mb-2">{{ vul.title }}</div>
      <div class="description">{{ vul.description }}</div>
    </g-link>
  </div>
</template>

<script>
import {toBlogDateStr, severityColor} from '~/js/functions'

export default {
  name: 'ModelThreatsListItem',
  props: {
    vul: {
      type: Object,
      default() {
        return {
          path: '1',
          title: '2',
          description: '3',
        }
      }
    },
  },
  data() {
    return {
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
    },

  }
}
</script>

<style lang="scss">
.mt-list-cube {
  padding: 8px;
  border: 1px solid transparent;
  transition: all ease-in-out 0.3s;
  border-radius: 2px;

  &:hover {
    background-color: #F8FAFB;
    transition: all ease-in-out 0.3s;
    border-color: #D2DFED;

    .mt-list-item {
      border-bottom-color: #1F2F4A;

    }
  }
}

.mt-list-item {
  display: flex;
  flex-direction: column;
  text-align: left;
  color: #000000;
  border-bottom: 2px solid #3EB065;
  max-width: 300px;
  height: inherit;
  padding: 0px 0px 36px;
  transition: all ease-in-out 0.3s;

}

.title {
  font-size: 24px;
  line-height: 1.3;
}

.description {
  font-size: 14px;
  line-height: 1.3;
}
</style>