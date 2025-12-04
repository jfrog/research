---
excerpt: Critical CVSS 10 vulnerabilities CVE-2025-55182 and CVE-2025-66478 lead to remote code execution in React-based web applications.
title: CVE-2025-55182 and CVE-2025-66478 (“React2Shell”) - All you need to know
date: "December 4, 2025"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '4'
---

## What happened

A critical React vulnerability - CVE-2025-55182 (and the corresponding CVE-2025-66478 in Next.js) was [published by the React maintainers](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components).
The vulnerability was named "React2Shell" [by the original researcher](https://react2shell.com/) as it leads to arbitrary code execution by remote (possibly unauthenticated) attackers.

A remote attacker could craft a malicious HTTP request to any React Server Function endpoint that, when deserialized by React, achieves arbitrary code execution on the server.
The exploitation success rate is reported to be nearly 100% in default configurations.

Currently there are no proof of concept exploits for either of the vulnerabilities. While some PoCs have been published on GitHub (most notably - [this one](https://github.com/ejpir/CVE-2025-55182-poc/)), all current PoCs have been proven to be fake. **We urge users not to run untrusted PoC code** as these types of projects have been known to contain malicious code.

## Who is vulnerable to React2Shell?

### React servers that use React Server Function endpoints
React servers that use **React Server Function endpoints** are vulnerable. *This section will be updated soon with more detailed identification steps.*

### Next.js web applications that use App Router
The most likely exploitation vector would be through Next.js web applications (CVE-2025-66478), since these are vulnerable in their default configuration. 
For example, creating a Next.js app with the standard `create-next-app` command and using the recommended values creates a vulnerable application, since these values enable the Next.js **App Router**, which gives access to the vulnerable React Server Function endpoints.
These next.js applications will contain the app directory which means they are using the vulnerable App Router.

![](/img/RealTimePostImage/react2shell/AppRouterConfig.png)

![](/img/RealTimePostImage/react2shell/AppRouterDir.png)

### Vulnerable packages & Fixed versions



| Vulnerable Components     | Vulnerable Versions        | Fixed Versions |
|:------------------------- | :------------------------- | :------------------------- |
| react-server-dom-webpack | 19.0.0<br />19.1.0 - 19.1.1<br />19.2.0 | 19.0.1<br />19.1.2<br />19.2.1 |
| react-server-dom-parcel | 19.0.0<br />19.1.0 - 19.1.1<br />19.2.0 | 19.0.1<br />19.1.2<br />19.2.1 |
| react-server-dom-turbopack | 19.0.0<br />19.1.0 - 19.1.1<br />19.2.0 | 19.0.1<br />19.1.2<br />19.2.1 |
| Next.js | 15.0.0 - 15.0.4<br />15.1.0 - 15.1.8<br />15.2.0 - 15.2.5<br />15.3.0 - 15.3.5<br />15.4.0 - 15.4.7<br />15.5.0 - 15.5.6<br />16.0.0 - 16.0.6 | 15.0.5<br />15.1.9<br />15.2.6<br />15.3.6<br />15.4.8<br />15.5.7<br />16.0.7 |
| Next.js | 14.3.0-canary.77 and later canary versions | Downgrade to the latest stable 14.x release by running `npm install next@14` |
| Other Frameworks | Any framework/library bundling the vulnerable React RSC implementation (e.g., Vite RSC plugin, Parcel RSC plugin, React Router RSC preview, RedwoodSDK, Waku) |  |

## How can I mitigate React2Shell?

* **The definitive way** to resolve CVE-2025-55182 and CVE-2025-66478 is to upgrade the vulnerable packages to one of the fixed version from the table above.

If an immediate upgrade is not possible, the following workarounds can also make the vulnerability unexploitable -

* **Next.js apps** - If App Router functionality is not required, disable the App Router. *This section will be updated soon with more detailed guidance.*



## How can I track React2Shell?
* Using the JFrog Platform:
  * The vulnerabilities are tracked in Xray as **XRAY-900398** & **XRAY-900476**.
  * Xray's Catalog provides comprehensive visibility by automatically detecting all vulnerable React/Next.js packages and offering prioritized remediation paths using fixed version data.

* Using an open-source detector - https://github.com/fatguru/CVE-2025-55182-scanner
This is a surface-level scanner that works by sending a crafted HTTP request to a target server running Next.js or another framework using the vulnerable RSC Flight protocol. The request contains a payload designed to leverage the insecure deserialization logic within the core React packages, which, in a vulnerable state, causes a distinctive server-side exception or crash by trying to access an undefined object property; the scanner then checks the server's response to confirm the vulnerability's presence **without executing an actual exploit**.

