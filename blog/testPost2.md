---
title: wow
published: true
description: This is a guide for everything to set up in the repository to make this place your own! Regardless of if you're new to Gridsome or just looking for the checklist of things to update when you clone this project, this post is for you!
tags: gridsome, setup
date_published: "2021-06-24"
og_image: ./og/ogImage.png
---

## Gridsome

> This post assumes you have already installed Gridsome, cloned the repository, and cloned it to your local machine. If you haven't, refer to https://gridsome.org/docs/

From the repository on your local computer, run `yarn` to install all necessary npm files.

### Develop mode

From the repository you can run `gridsome develop` to spin up a local copy of the site for testing changes.

## Files to change:

### Set your Site/Brand Name!

```js{codeTitle: "gridsome.config.js"}
module.exports = {
  // Set this to whatever you want! 👇
  // Note: This will default to be the header link back to your home page
  siteName: "Cutting Edge Security Research to Protect the Modern Software Supply Chain",
  // Set this your domain/url! 👇
  // Note: This is used by the sitemap plugin to make your site searchable on Google!
  siteUrl: "https://twblog.terabytetiger.com",
  //..
};
```

### Set the Base URL for calculating Canonical URLs

```js{codeTitle: "gridsome.server.js"}
module.exports = function(api) {
  api.loadSource(async (store) => {
    // Replace https://twblog.terabytetiger.com with your website url!
    store.addMetadata("baseURL", "https://twblog.terabytetiger.com");
  });
  //...
};
```

> This is important because it will dictate what the canonical url is for your blog posts!

### Update the Social links from mine to yours!

```vue{codeTitle: "/src/components/Social.vue"}
// Set this to your Twitter Profile! 👇
<a href="https://twitter.com/terabytetiger" class="inline-block">
  // ...
</a>
// Set this to your Youtube Channel! 👇
<a
  href="https://www.youtube.com/channel/UCZeMnP2XoSh724u4v8Oskwg"
  class="inline-block"
>
  // ...
</a>
// Set this to your Instagram Account! 👇
<a href="https://www.instagram.com/t.vanblargan/" class="inline-block">
  // ...
</a>
// Set this to your LinkedIn Profile! 👇
<a href="https://linkedin.com/" class="inline-block">
  // ...
</a>
```

> Note that the social link icons provided are custom made for this project and that updating the component will update both the home page links and the links at the bottom of blog posts!

### Update your home page to be about you!

```vue{codeTitle: "/src/Index.vue"}
<template>
  <Layout>
    // Replace this with a welcome message to visitors! 👇
    <h1 class="text-4xl bold underline pb-4">Hello, world!</h1>

    // Replace this with a short Bio about you! 👇
    <p class="text-2xl">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur
      excepturi labore tempore expedita, et iste tenetur suscipit explicabo!
      Dolores, aperiam non officia eos quod asperiores
    </p>
    //...
  </Layout>
</template>
// ...
<script>
export default {
  name: "Homepage",
  metaInfo() {
    return {
      meta: [
        {
          name: "description",
          // Describe what the page is about! This shows in Google Search Results👇
          content: "My blog posts and musings on the world.",
        },
      ],
    };
  },
};
</script>
```

### Update Header Background Color

```vue{codeTitle: "/src/layouts/Default.vue"}
<template>
  <div class="layout">
    // Replace bg-blue-100 with any of the other colors Tailwind includes 👇
    <header class="p-8 bg-blue-100 mb-8 shadow-md">
    //...
  </div>
</template>
```

> You can find a list of tailwind background colors here: https://tailwindcss.com/docs/background-color

### Reroute from my Twitter handle to yours for shared posts

```vue{codeTitle: "/src/templates/Post.vue"}
<script>
// Skip to lines 40:
        {
          name: "twitter:creator",
          // Replace this with your Twitter handle 👇
          content: "@terabytetiger",
        },
        {
          name: "twitter:site",
          // Replace this with your Twitter handle or your Brand's twitter handle 👇
          content: "@terabytetiger",
        },
</script>
```

> If you want to make your Twitter shares even more enticing to click on you can add a meta item for `og:image` to populate in the Twitter card!

### Update the Site Favicon

```js{codeTitle: "/src/favicon.png"}
// Replace this with an image to use as the favicon for your site!
```

> 🚨 If you use a file name other than favicon.png you need to update gridsome.config.js with the icon property: https://gridsome.org/docs/config/#icon

## Blog Posts

### Remove Existing Blog Posts

Clear out the `testPost1.md` and `testPost2.md` files from the `/blog/` root level folder.

### Adding New Blog Posts

To add new blog posts, create `postTitle.md` files in the `/blog/` root level folder.

The first thing in each of your blog post markdown file should be the following information which is required for the site to build:

```md{codeTitle: "/blog/yourMarkdownFile.md"}
---
title: Set Up This Blog
published: true
description: This is a guide for everything to set up in the repository to make this place your own!
date_published: "2021-06-24"
og_image: ./path/to/og/image.png
---
```

> The `date_published` is in YYYY-MM-DD format so that the blog list on the home page can be sorted with the newest items at the top of the page.

> Note that the title of the post is automatically added as the h1 tag on the post page and all markdown content should start at the `##heading 2` level to prevent accessibility issues.

> `og_image` is the image that will show when the link is shared in places like Facebook or Twitter

## How to publish online

Once you've updated the above information and are ready to publish your blog to the world, you can follow my [guide on publishing to a custom domain using Hover and Netlify](https://terabytetiger.com/lessons/articles/website-deployment-with-hover-and-netlify/)

If you want to expand your site to include a customized 404 page you can [follow my Gridsome 404 page guide](https://terabytetiger.com/lessons/articles/create-a-custom-404-page-in-gridsome/)
