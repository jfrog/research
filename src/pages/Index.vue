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
      />
    </ImageTitleText>

    <ListAndBanner
      title="Latest malicious packages disclosed by the team"
      :banner="malBanner"
      :list="VulnerList"
    />


    

  </Layout>


  
</template>




<script>
import HomeHero from './../page-parts/home/HomeHero'
import ImageTitleText from './../components/ImageTitleText'
import ListAndBanner from './../components/ListAndBanner.vue'
import VulnerList from './../components/VulnerList.vue'

export default {
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
        number: "400",
        title: "Vulnerabilities discovered",
        link: {
          title: 'See All Vulnerabilities >',
          to: '/vulnerabilities'
        },
        date: "10 Jan 2021",
      },
      malBanner: {
        color: "gray-700",
        number: "1,000",
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
    ImageTitleText,
    ListAndBanner,
    VulnerList
  }
};
</script>
