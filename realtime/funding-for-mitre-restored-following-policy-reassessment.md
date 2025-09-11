---
excerpt: Our security research team has discovered a harmful PyTorch model on @huggingface, identified as dtonala/DeepSeek-R2, which is delivering the XMRig cryptominer as its payload. This poses a significant threat, particularly considering the popularity of DeepSeek-R1 and the beta
title: Malicious DeepSeek‑R2 PyTorch Model Discovered Hosting XMRig Miner
date: "May 23, 2025"
description: "Or Peles,  JFrog Senior Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/malicious-deepseek‑r2-pytorch-model-discovered-hosting-xmrig-miner.png
type: realTimePost
minutes: '12'


---


Our security research team has discovered a harmful PyTorch model on [@huggingface](https://x.com/huggingface), identified as **dtonala/DeepSeek-R2**, which is delivering the **XMRig cryptominer** as its payload. This poses a significant threat, particularly considering the popularity of DeepSeek-R1 and the beta status of DeepSeek-R2, which could allow attackers to take advantage of user trust and distribute a model that conceals a crypto miner download. Users who are unaware and enthusiastic about trying out DeepSeek-R2 may fall victim to this threat. Notably, the malicious model is in PyTorch format, contrasting with the official DeepSeek models, which utilize the safetensors format.



![](/img/RealTimePostImage/post/malicious-deepseek‑r2-pytorch-model-discovered-hosting-xmrig-miner-post.png)
