<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <link rel="canonical" href="/">
  <meta http-equiv="refresh" content="0; url=/">
</head>
<body>
<script>window.location.href = "/";</script>
</body>
</html>
<script>
import {toBlogDateStr} from '~/js/functions'
import BannerSmall from '~/components/BannerSmall'
import MalicListItem from '~/components/MalicListItem'

export default {
  mounted() {
    this.$router.replace('/');
  },
  data() {
    return {
      title: 'Malicious Packages',
      bannerTitle: 'Malicious packages <br> disclosed',
      postsPerPage: 10,
      currentPage: 1,
      MalicListItem: MalicListItem,
    }
  },
  computed: {
    malPackagesComp() {
      return require('./../malicious/malicious-data.json')
    },
    latestPostDate() {
      let firstPost = this.malPackagesComp[0]
      let latestDate = firstPost.date_published
      return toBlogDateStr(latestDate)
    },
    postsChunks() {
      let allPosts = [...this.malPackagesComp]
      const postsChunks = this.chunks(allPosts, this.postsPerPage)
      return postsChunks
    },
    activeChunk() {
      const index = this.currentPage-1 ? this.currentPage-1 : 0
      return this.postsChunks[index]
    },
    bannerNumber() {
      return this.malPackagesComp.length.toString()
    },
  },
  components: {
    BannerSmall,
    MalicListItem
  },
  methods: {
    chunks: function(array, size) {
      var results = [];
      while (array.length) {
        results.push(array.splice(0, size));
      }
      return results;
    },
    getPaginationClass: function(pageNum) {
      
      let calculatedClass = 'w-8 h-8 text-sm flex items-center justify-center hover:bg-jfrog-green hover:text-white transition-all'
      
      const 
        normalClass = ' bg-gray-300 text-black',
        activeClass = ' bg-jfrog-green text-white'
      
      if (pageNum === this.currentPage) {
        calculatedClass += activeClass
      } else {
        calculatedClass += normalClass
      }

      return calculatedClass
    }
  },
  metaInfo() {
    return {
      title: `Malicious Packages`,
      meta: [
        {
          name: "title",
          content: `Software Vulnerabilities`,
        },
        {
          name: "description",
          content: `The latest malicious open-source packages discovered by the JFrog security research team`,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: 'https://research.jfrog.com/malicious-packages/',
        },
      ],
    };
  },
}

</script>

<style lang="scss">
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
</style>