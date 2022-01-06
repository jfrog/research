<template>
  <section class="green-radial-gradient py-10 sm:py-33">
    <div class="container mx-auto px-2">
      <div class="flex flex-wrap justify-between items-center pb-10">
        <h2 class="text-white"> {{title}} </h2>    
        <BannerButton :link="link" />
      </div>

      <div class="latest-security-posts">
        <div class="grid overflow-hidden grid-cols-3 grid-rows gap-2">
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
        to: 'https://walla.com/blog/tag/security/'
      },
      latestPosts: [
        {
          img: 'sec-blog-img-1.png',
          title: 'Unboxing BusyBox – 14 new vulnerabilities uncovered by Claroty and JFrog',
          description: 'By Vera Mens, Uri Katz, Tal Keren, Sharon Brizinov from Claroty Research. Shachar Menashe from JFrog',
          minutes: '10',
          href: 'https://jfrog.com/blog/devops-2022-5-big-rocks-to-harness-the-software-supply-chain/'
        },
        {
          img: '~/assets/img/blog-exm/sec-blog-img-2.png',
          title: 'Unboxing BusyBox – 14 new vulnerabilities uncovered by Claroty and JFrog',
          description: 'By Vera Mens, Uri Katz, Tal Keren, Sharon Brizinov from Claroty Research. Shachar Menashe from JFrog',
          minutes: '10',
          href: 'https://jfrog.com/blog/devops-2022-5-big-rocks-to-harness-the-software-supply-chain/'
        },
        {
          img: '~/assets/img/blog-exm/sec-blog-img-3.png',
          title: 'Unboxing BusyBox – 14 new vulnerabilities uncovered by Claroty and JFrog',
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

<style lang="scss">
  @import './../../assets/style/variables';
  .home-hero {
    .content {
      // width: 55%;
      h1 {
        width: 514px;
        max-width: 100%;
      }
      p {
        width: 404px;
        max-width: 100%;
      }
    }
  }
</style>