<template>
  <Layout>
    <HomeHero />
    
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
    />

    <LatestFromBlog />

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
      }
    }
  }
}
</static-query>

<script>

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

//data
// import malicJSON from '~/malicious/malicious-data.json'
import {malPackages} from '~/malicious/malicious-packages.js'

export default {
  mounted() {

      let allPosts = [...this.$static.posts.edges]

      this.malBanner.number = malPackages.length.toString()

      let onlyVulners = allPosts.filter( p => p.node.type === 'vulnerability' )
      this.vulnerBanner.number = onlyVulners.length.toString()

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
  data() {
    return {
      VulnerList: VulnerList,
      MalicList: MalicList,
      softwareVulnerabilities: {
        title: "Software Vulnerabilities",
        par: `JFrog security researchers and engineers collaborate to create advanced vulnerability scanners, built on a deep understanding of attackers' techniques.
        <br><br>
        We use our automated scanners to help the community by continually identifying new vulnerabilities in publicly available software packages and disclosing them.`,
      },
      maliciousPackages: {
        title: "Malicious Packages",
        par: `Given the widespread use of open-source software (OSS) packages in modern application development, public OSS repositories have become a popular target for supply chain attacks.
        <br><br>
        To help foster a secure environment for developers, the JFrog Security research team continuously monitors popular repositories with our automated tooling, and reports malicious packages discovered to repository maintainers and the wider community.`,
      },
      vulnerBanner: {
        color: "jfrog-green",
        number: "-",
        title: "Vulnerabilities discovered",
        link: {
          title: 'See All Vulnerabilities >',
          to: '/vulnerabilities'
        },
        date: "10 Jan 2021",
      },
      malBanner: {
        color: "gray-700",
        number: "-",
        title: "Malicious packages disclosed",
        link: {
          title: 'See All Packages >',
          to: '/malicious-packages'
        },
        date: "12 Jan 2022",
      }
    }
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
  }
};
</script>
