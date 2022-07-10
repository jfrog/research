<template>
  <Layout>
    <div class="container sm:pt-10 mt-12 pb-12" >

      <div class=" flex-col sm:grid  sm:mt-6  justify-center sm:grid-cols-2 sm:justify-between">
        <div class="left left-oss text-center sm:text-left">
          <h1 class=" mb-0 pb-4 font-bold"> {{title}} </h1>
          <p v-html="par">  </p>
          <a class="left-link mt-8 inline-block	" href="https://jfrog.com/getcli/" target="_blank">Scan with JFrog CLI <span> > </span></a>
        </div>
        <div class="right right-oss mt-9 sm:mt-2 mx-auto ml-10 sm:ml-0 ">
          <g-image
              src="~/assets/img/oss/oss-hero.svg"
              :immediate="true"
              class="placeholder-image flex-auto w-1"
              alt="oss Packages"
          />
        </div>
      </div>

      <div class="posts pt-5 sm:pt-10 pb-12 ">

        <ul class="grid gap-12  grid-cols-1 sm:grid-cols-3 pt-12 mt-2" v-for="(edge1,label, index1) in categoriesChunks":key="index1" >
          <div class="sm:col-span-2">
          <div class="oss-big-title ">{{edge1.title}} </div>
          <div class="oss-info" v-html="edge1.description"></div>

            <component
              :is="OssListItem"
              v-for="(edge, index) in edge1.posts"
              :key="index"
              :oss="edge"

          />
          </div>
         <OssLatestFromBlog :post="{title:label}" />
        </ul>
      </div>



    </div>
  </Layout>
</template>

<script>
import BannerSmall from '~/components/BannerSmall'
import OssListItem from '~/components/OSSListItem'
import OssLatestFromBlog from '~/components/OssLatestFromBlog'

export default {
  data() {
    return {
      title: 'OSS Security Scanning Tools resource page',
      par:`<b>Validate open source security in your software using OSS tools from JFrog Security</b>
          When a new security threat – such as a zero-day vulnerability in a publicly available open-source package – arises, the time to respond is of the essence.
          We are happy to support the community with a range of OSS scan tools to identify such threats in your software quickly. These tools are continually developed by the JFrog Security Research team – the security experts behind JFrog Xray
          JFrog's OSS tools can be used for detecting exposure to known vulnerabilities (either dynamically or statically), for determining susceptibility to various supply-chain attacks and for evaluating software packages that may contain malicious code.`,
      postsPerPage: 10,
      currentPage: 1,
      OssListItem: OssListItem,
      OssLatestFromBlog:OssLatestFromBlog,
    }
  },
  computed: {
    ossComp() {
      return require('../oss/oss-data.json')
    },
    ossCategoryData() {
      return require('../oss/oss-categories.json')
    },
    categoriesChunks() {
      let allPosts = [...this.ossComp];
      let allCategory = [...this.ossCategoryData];

      let Categories={};
      allPosts.forEach(post=> {
        if( !Categories.hasOwnProperty(post.category)) {
         let data= allCategory.find(x=>x.category===post.category)

          Categories[post.category]={posts:[],title:data.title,description:data.description}

        }


        Categories[post.category]['posts'].push(post)

      });

      return Categories;

    },
    postsChunks() {
      let allPosts = [...this.ossComp]
      const postsChunks = this.chunks(allPosts, this.postsPerPage)
      return postsChunks
    },
    activeChunk() {
      const index = this.currentPage-1 ? this.currentPage-1 : 0
      return this.postsChunks[index]
    },
    bannerNumber() {
      return this.ossComp.length.toString()
    },
  },
  components: {
    BannerSmall,
    OssListItem,
    OssLatestFromBlog,
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
      title: `OSS Security Scanning Tools resource page`,
      meta: [
        {
          name: "title",
          content: `Software Vulnerabilities`,
        },
        {
          name: "description",
          content: `The latest oss tools discovered by the JFrog security research team`,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: 'https://research.jfrog.com/oss/',
        },
      ],
    };
  },
}

</script>


<style lang="scss">
@import './../assets/style/variables';

.right-oss{
  width: 100%;
  max-width: 70%;

  img{
    width: 100%;
    max-width: 100%;
    height: 100%;
  }
  @media screen and (min-width: #{$sm}) {
    min-width: 431px;
    max-width: 100%;

  }

  }
.left-oss{
  max-width: 490px;
  .left-link{
    background-color: #40BE46;
    padding:7px 19px;
    color: white;
    border: 2px solid #40BE46;
    position: relative;
    span{
      position: relative;
      left: 0;
      transition: all ease-in-out 0.3s;

    }
    &:hover{
      span{
        left: 5px;
        transition: all ease-in-out 0.3s;

      }
    }


  }
  p{
    white-space: pre-line;
  }

}
.oss-info{
  margin-bottom: 4.688rem;
  margin-top: 1.625rem;
  max-width: 766px;
  line-height:22px ;
  white-space: pre-line;
}
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
.oss-big-title{
  font-size: 2rem;
  color: black;
  text-transform: capitalize;
}
</style>