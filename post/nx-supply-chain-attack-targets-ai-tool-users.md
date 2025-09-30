---
excerpt: Within the past day, a novel and sophisticated supply chain attack has targeted npm users through the compromise of the popular Nx build system.
title: Nx Supply Chain Attack Targets AI Tool Users
date: "August 28, 2025"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '2'

---

Within the past day, a novel and sophisticated supply chain attack has targeted npm users through the compromise of the popular Nx build system. With ~4M weekly downloads, Nx was leveraged by the attacker to exploit installed AI CLI tools and attempt theft of sensitive data, including developer credentials and crypto wallet information. 

![](/img/RealTimePostImage/post/nx-build-system-1.jpeg)

The attacker exploited the classic npm `post-install` script mechanism to execute malicious code immediately after installation. But this time, the approach was more sophisticated: it attempted to leverage common AI agents such as Gemini, Claude, and Amazon Q, to generate malicious activity, bypassing their built-in protections with a designated flag.

![](/img/RealTimePostImage/post/nx-build-system-2.jpeg)

The stolen data collected by the package was then stored in a base64 encoded file under `/tmp/inventory.txt`, and then leaked through the user's GitHub account, utilizing the stolen GH tokens to create a repo called s1ngularity-repository which stored the data.

As usual, the Xray database and the JFrog Catalog were updated as soon as the information was publicly available, making sure our clients receive the most updated and accurate alerts on malicious packages.