---
excerpt: The JFrog security research team identified an ongoing supply-chain campaign on npmjs, starting with keyv & cacheable; attributed to the Shai-Hulud malware family. We're investigating, and the post will be updated with all technical details soon.
title: Shai-Hulud's here - Cacheable and Keyv Packages Compromised
date: "August 4, 2026"
description: "Shavit Satou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/hulud_august.png
type: realTimePost
minutes: '5'
---

The JFrog security research team identified a new version of the Shai-Hulud supply-chain malware. The compromise began by affecting the `cacheable` and `keyv` npm packages. Both packages are widely used caching libraries, and `keyv` is a transitive dependency of many popular tools. If you installed a compromised version, assume your environment is affected. This is an ongoing investigation. We are publishing this short notice now and will update it with full technical analysis, affected versions, and remediation steps shortly.

Note that if you're running npm 12 or newer, `preinstall` lifecycle hooks *will not* execute by default, so the malware will not infect you.

![](/img/RealTimePostImage/post/hulud_august.png)

# Compromised packages

The list will be updated shortly.

| Package | Version |
| ------- | ------- |
| keyv | 6.0.0 |
| @thiennq/docs-viewer | 1.6.2 |
| @cacheable/utils | 2.5.1 |
| flat-cache | 6.1.24 |
| file-entry-cache | 11.1.6 |
| cacheable-request | 13.0.20 |
| cacheable | 2.5.1 |
| cache-manager | 7.2.10 |
| @cacheable/net | 2.1.1 |
| @cacheable/node-cache | 3.1.2 |
| @cacheable/memory | 2.2.1 |
| @or-sdk/auth | 0.38.1 |
| @or-sdk/api-tokens | 1.4.3 |
| @onereach/billing-dto | 27.2.1 |
| @arv-bedrock/auth | 1.1.8 |
| @deliveroo/determinator | 0.2.1 |
| @deliveroo/reevent | 1.0.1 |
| @servicetitan/tokens | 12.9.3 |
| @qlik/embed-react | 2.5.3 |
| @nebula.js/sn-nav-menu | 0.14.2 |
| @hubsync/web-sdk-react | 6.3.7, 6.3.8, 6.3.9, 6.3.10, 6.3.11, 6.3.12, 6.3.13, 6.3.14, 6.3.15, 6.3.16, 6.3.17, 6.3.18, 6.3.19, 6.3.20, 6.3.21, 6.3.22, 6.3.23, 6.3.24, 6.3.25, 6.3.26, 6.3.27, 6.3.28, 6.3.29, 6.3.30, 6.3.31, 6.3.32, 6.3.33 |
| @ornikar/eslint-config | 24.0.1, 24.0.2, 24.0.3, 24.0.4, 24.0.5, 24.0.6 |
| @ornikar/repo-config | 15.3.3 |
| @ornikar/eslint-config-typescript | 24.0.1 |
| @ornikar/graphql-config | 1.1.1, 1.1.2, 1.1.3, 1.1.4, 1.1.5 |
| @picsart/ai-sdk | 3.32.2 |

