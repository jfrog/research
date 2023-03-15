<template>
  <Layout>
    <HomeHero />
    <LatestFromBlog />
    <ImageTitleText
      :title="softwareVulnerabilities.title"
      :par="softwareVulnerabilities.par"
    >
      <g-image
        src="~/assets/img/home-page/vulnerabilities.svg"
        :immediate="true"
        class="placeholder-image flex-auto w-1"
        alt="Software Vulnerabilities"
      />
    </ImageTitleText>

    <ListAndBanner
      title="Latest vulnerabilities discovered by the team"
      :banner="vulnerBanner"
      :list="VulnerList"
      :bannerDate="latestVulnerabilityDate"
      gaa="Vulnerabilities"
      gal="See All Vulnerabilities"
    />

    <ImageTitleText
      :title="maliciousPackages.title"
      :par="maliciousPackages.par"
    >
      <g-image
        src="~/assets/img/home-page/malicious-packages.svg"
        :immediate="true"
        class="placeholder-image flex-auto w-1"
        alt="Malicious Packages"
      />
    </ImageTitleText>

    <ListAndBanner
      title="Latest malicious packages disclosed by the team"
      :banner="malBanner"
      :list="MalicList"
      :bannerDate="latestMalDate"
      gaa="Malicious Packages"
      gal="See All Packages"
    />

    <ImageTitleText
        :title="OSSTools.title"
        :par="OSSTools.par"
    >
      <g-image
          src="~/assets/img/home-page/osstool.svg"
          :immediate="true"
          class="placeholder-image flex-auto w-1"
          alt="OSS Tools"
      />
    </ImageTitleText>

    <ListAndBanner
        title=""
        :banner="ossBanner"
        :list="OSSList"
        :bannerDate="latestOSSDate"
        gaa="OSS Vulnerabilities"
        gal="See All OSS Tools"
    />



    <DetectionEdge />
    
    <Report />
    
    <Powered />


  </Layout>  
</template>

<static-query>
query Blog {
  posts: allPost (
    sortBy: "date_published",
  ){
    edges {
      node {
        type
        date_published
      }
    }
  }
}
</static-query>

<script>

//functions
import {toBlogDateStr} from './../js/functions'

//parts
import HomeHero from './../page-parts/home/HomeHero'
import LatestFromBlog from './../page-parts/home/LatestFromBlog'
import DetectionEdge from './../page-parts/home/DetectionEdge'
import Report from './../page-parts/home/Report'
import Powered from './../page-parts/home/Powered'

//components
import ImageTitleText from './../components/ImageTitleText'
import ListAndBanner from './../components/ListAndBanner.vue'
import VulnerList from './../components/VulnerList.vue'
import MalicList from './../components/MalicList.vue'
import OSSList from './../components/OSSList.vue'
import malPackages from "./../malicious/malicious-data.json";

export default {

  mounted() {

      let allPosts = [...this.$static.posts.edges]

      const malPackages = require('./../malicious/malicious-data.json')


      this.malBanner.number = malPackages.length.toString()

      let onlyVulners = allPosts.filter( p => p.node.type === 'vulnerability' )
      
      this.vulnerBanner.number = onlyVulners.length.toString()

    const ossToolsList = require('./../oss/oss-data.json')

    this.ossBanner.number = ossToolsList.length.toString()


  },
  metaInfo: {
    title: "JFrog Security Research",
    titleTemplate: "JFrog Security Research",
    meta: [
      {
        name: "title",
        content: "JFrog Security Research",
      },
      {
        name: "description",
        content: "The latest security issues and vulnerabilities discovered by the JFrog security research team! CVE's, malicious packages and more",
      },
      {
        name: "google-site-verification",
        content: "22wipx-oHtD2k4YCDe8uUqr0MOjdLgBTUaqWznU14uw"
      }
    ],
    link: [
      {
        rel: "canonical",
        content: 'https://research.jfrog.com',
      },
    ],
  },
  data() {
    return {
      VulnerList: VulnerList,
      MalicList: MalicList,
      OSSList:OSSList,
      softwareVulnerabilities: {
        title: "Latest vulnerabilities discovered by the team",
        par: `JFrog security researchers and engineers collaborate to create advanced vulnerability scanners, built on a deep understanding of attackers' techniques.
        <br><br>
        We use our automated scanners to help the community by continually identifying new vulnerabilities in publicly available software packages and disclosing them.`,
      },
      maliciousPackages: {
        title: "Latest malicious packages disclosed by the team",
        par: `Given the widespread use of open-source software (OSS) packages in modern application development, public OSS repositories have become a popular target for supply chain attacks.
        <br><br>
        To help foster a secure environment for developers, the JFrog Security research team continuously monitors popular repositories with our automated tooling, and reports malicious packages discovered to repository maintainers and the wider community.`,
      },
      OSSTools: {
        title: "Latest security OSS tools released by the team",
        par: `When new software security threats arise, in many cases the time to respond is of the essence.
        <br/>
        The JFrog Security research team supports the community with a range of OSS tools to identify such threats in your software quickly.`,
      },
      vulnerBanner: {
        color: "jfrog-green",
        number: "-",
        title: "Vulnerabilities discovered",
        link: {
          title: 'See All Vulnerabilities >',
          to: '/vulnerabilities/'
        },
      },
      malBanner: {
        color: "gray-700",
        number: "-",
        title: "Malicious packages disclosed",
        link: {
          title: 'See All Packages >',
          to: '/malicious-packages/'
        },
      },
      ossBanner: {
        color: "jfrog-green",
        number: "-",
        title: "OSS tools released",
        link: {
          title: 'See All OSS Tools >',
          to: '/oss/'
        },
      },
    }
  },
  computed: {
    latestVulnerabilityDate() {
      let allPosts = [...this.$static.posts.edges]
      let firstPost = allPosts[0]
      let latestDate = firstPost.node.date_published
      return toBlogDateStr(latestDate)
    },
    latestMalDate() {
      const malPackages = require('./../malicious/malicious-data.json')
      return toBlogDateStr(malPackages[0].date_published)
    },
    latestOSSDate() {
      const ossToolsList = [...require('../oss/oss-data.json')]
      return toBlogDateStr(ossToolsList.sort((a,b)=>new Date(b.date_published)-new Date(a.date_published))[0].date_published)
    },
  },
  components: {
    HomeHero,
    LatestFromBlog,
    ImageTitleText,
    DetectionEdge,
    Report,
    Powered,
    ListAndBanner,
    VulnerList,
    MalicList,
    OSSList,
  }
};
</script>
