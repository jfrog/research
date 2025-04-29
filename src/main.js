// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

// Import Tailwind CSS
require("~/main.css");

//Remark Syntax Highlighting
// first install: "gridsome-plugin-remark-prismjs-all": "^0.4.8" then uncomment:
// require("gridsome-plugin-remark-prismjs-all/themes/night-owl.css");
// require("prismjs/plugins/line-numbers/prism-line-numbers.css");
// require("prismjs/plugins/command-line/prism-command-line.css");

import DefaultLayout from "~/layouts/Default.vue";

require("~/assets/style/custom.scss");

export default function(Vue, { router, head, isClient }) {
  //speadsize head script.
  // TODO add a condition for not doing it on local env, something like `if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1")`
  head.script.push({
    src: '/speedsize-local.js',
  })
  head.meta.push({
    'http-equiv' :"Content-Security-Policy",
    content: "default-src *  'self' 'unsafe-eval' 'unsafe-inline'  https://jfrog.com; img-src 'self' * data: ; font-src 'self' * data: ;"
  });

  head.script.push({
    src: "https://transcend-cdn.com/cm/f0071674-c641-4cf3-9d31-303ec0c86b1b/airgap.js",
    "data-languages": "en",
    "data-tracker-overrides": "GoogleConsentMode:security_storage=on;ad_storage=SaleOfInfo,Advertising;ad_user_data=SaleOfInfo,Advertising;ad_personalization=SaleOfInfo,Advertising;analytics_storage=Analytics,SaleOfInfo;functionality_storage=Functional,SaleOfInfo;personalization_storage=Functional,SaleOfInfo",
    "data-cfasync": "false",

    type: "text/javascript",
    charset: "utf-8"
  });

  head.script.push({
    innerHTML: `
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "GTM-T6MF8M");
      gtag('set', 'developer_id.dODQ2Mj', true);
    `,
    type: "text/javascript",
    charset: "utf-8"
  });

  head.script.push({
    innerHTML: `
    if (window.airgap) {
      const cookieSettings = document.getElementById('cookie_settings') || document.querySelector('.ot-sdk-show-settings');
      cookieSettings.href = "#";
      cookieSettings.target = "_self";
      cookieSettings.onclick = () => {
        transcend.showConsentManager({ viewState: 'CompleteOptions' });
      };
    }
  `,
    type: "text/javascript",
    charset: "utf-8",
    body: true
  });

  // Set default layout as a global component
  Vue.component("Layout", DefaultLayout);

}
