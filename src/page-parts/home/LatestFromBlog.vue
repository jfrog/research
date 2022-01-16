<template>
  <section class="green-radial-gradient py-10 sm:py-33 border-b-2 border-white">
    <div class="container mx-auto px-2">
      <div class="flex flex-wrap justify-between items-center pb-10">
        <h2 class="text-white"> {{title}} </h2>    
        <BannerButton :link="link" />
      </div>

      <div class="latest-security-posts">
        <div class="grid overflow-hidden grid-cols-1 sm:grid-cols-3 grid-rows gap-2">
          <div 
            class="box row-span-1"
            v-for="p in latestPosts"
            :key="p.img"  
          >
            <SecurityBlogPreview :postObj="p" />
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import BannerButton from './../../components/BannerButton.vue'
import SecurityBlogPreview from './../../components/SecurityBlogPreview'
export default {
  data() {
    return {
      title: 'Latest from JFrog\'s Security Blog',
      link: {
        title: 'JFrog’s Security Blog >',
        to: 'https://jfrog.com/blog/category/xray/'
      },
      latestPosts: [
        {
          img: 'https://speedmedia.jfrog.com/08612fe1-9391-4cf3-ac1a-6dd49c36b276/https://media.jfrog.com/wp-content/uploads/2022/01/04230923/530x300-26.png/mxw_2560,f_auto',
          title: 'Unboxing BusyBox - 14 new vulnerabilities uncovered by Claroty and JFrog',
          description: 'By Vera Mens, Uri Katz, Tal Keren, Sharon Brizinov from Claroty Research. Shachar Menashe from JFrog',
          minutes: '10',
          href: 'https://jfrog.com/blog/devops-2022-5-big-rocks-to-harness-the-software-supply-chain/'
        },
        {
          img: 'https://speedmedia.jfrog.com/08612fe1-9391-4cf3-ac1a-6dd49c36b276/https://media.jfrog.com/wp-content/uploads/2022/01/06181000/JNDI-Unauthenticated-RCE-in-H2-Database-Console-375x290-1.png/mxw_2560,f_auto',
          title: 'Unboxing BusyBox - 14 new vulnerabilities uncovered by Claroty and JFrog',
          description: 'By Vera Mens, Uri Katz, Tal Keren, Sharon Brizinov from Claroty Research. Shachar Menashe from JFrog',
          minutes: '10',
          href: 'https://jfrog.com/blog/devops-2022-5-big-rocks-to-harness-the-software-supply-chain/'
        },
        {
          img: 'https://speedmedia.jfrog.com/08612fe1-9391-4cf3-ac1a-6dd49c36b276/https://media.jfrog.com/wp-content/uploads/2021/12/15024140/375x290-w.png/mxw_2560,f_auto',
          title: 'Unboxing BusyBox - 14 new vulnerabilities uncovered by Claroty and JFrog',
          description: 'By Vera Mens, Uri Katz, Tal Keren, Sharon Brizinov from Claroty Research. Shachar Menashe from JFrog',
          minutes: '10',
          href: 'https://jfrog.com/blog/devops-2022-5-big-rocks-to-harness-the-software-supply-chain/'
        },
      ]
    }
  },
  components: {
    BannerButton,
    SecurityBlogPreview
  }
}
</script>