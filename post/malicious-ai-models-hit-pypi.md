---
excerpt: Attackers are hiding malware inside PyTorch models in PyPI packages mimicking Alibaba’s Aliyun. Once installed, the payload exfiltrates system data, highlighting the growing risk of malicious AI in developer tools.
title: Malicious AI Models Hit PyPI 
date: "May 22, 2025"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '1'

---

Malware developers are using the rising popularity of AI models to cover their attacks. Today, we observed a fresh attack targeting developers through the PyPI repository: an infected Torch AI model was loaded in two malicious PyPI packages to deploy obfuscated malware. The two malicious packages were published by a user named ai-aliyun: ai-labs-snippets-sdk, aliyun-ai-labs-snippets-sdk. The name mimics Aliyun, Alibaba’s cloud platform, to make it appear trustworthy and gain downloads.

![](/img/RealTimePostImage/post/Malicious-AI-Models-Hit-PyPI-1.jpeg)

Once installed, the package supposedly loads a PyTorch model from a file called `model.pt`.
During the loading, obfuscated Python code is executed after being decoded as base64.

![](/img/RealTimePostImage/post/Malicious-AI-Models-Hit-PyPI-2.jpeg)

The payload gathers system information and exfiltrates it to `aksjdbajkb2jeblad[.]oss-cn-hongkong[.]aliyuncs[.]com`, which is hosted on Alibaba Cloud (Aliyun), adding another layer of disguise to the operation.

![](/img/RealTimePostImage/post/Malicious-AI-Models-Hit-PyPI-3.png)

Protecting against malicious ML models is a complex task. We’ve recently completed an integration into the Hugging Face platform, where users can see our scan results for uploaded models. Read more about our approach and initiative here: [JFrog and Hugging Face join forces](https://jfrog.com/blog/jfrog-and-hugging-face-join-forces/)