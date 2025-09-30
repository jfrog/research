---
excerpt: Amazon Q VS Code extension v1.84.0 was compromised with a malicious commit that could trigger destructive AI-generated commands.
title: Amazon Q VS Code Extension Compromised with Malicious Code 
date: "July 23, 2025"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '1'

---

An attacker was able to compromise the Amazon Q VS Code extension in version 1.84.0 by committing code with a malicious code into its Git Hub repository, according to a [story](https://www.404media.co/hacker-plants-computer-wiping-commands-in-amazons-ai-coding-agent/) by [@404mediaco](https://x.com/404mediaco). 

The compromised version has been removed and is no longer available. According to Amazon no users have been impacted. 

The attacker’s code adds a function to the VS Code extension which invokes Amazon’s Q cli tool, which allows developers to interact with ML models directly from the terminal, utilizing a malicious prompt. The malicious prompt asks the AI agent in use to produce commands for wiping the machine on which it’s running through bash commands, as well as cloud resources.

![](/img/RealTimePostImage/post/Amazon-Q-VS-Code-extension-1.jpeg)

This attack vector illustrates the growing sophistication level of supply chain attacks. As AI agents are more prevalent than ever, and in combination with IDE extensions, they can be leveraged to target different stages of the software development life cycle.