---
excerpt: Critical CVSS 10 vulnerabilities CVE-2025-55182 and CVE-2025-66478 lead to remote code execution in React-based web applications.
title: CVE-2025-55182 and CVE-2025-66478 (“React2Shell”) - All you need to know
date: "December 4, 2025"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '4'
canonical: https://jfrog.com/blog/2025-55182-and-2025-66478-react2shell-all-you-need-to-know/
---



**Update - Dec 4th 2025:** A remote code execution proof-of-concept exploit has been made public.



## What happened

A critical React vulnerability - CVE-2025-55182 (and the corresponding CVE-2025-66478 in Next.js) was [published by the React maintainers](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components).
The vulnerability was named "React2Shell" [by the original researcher](https://react2shell.com/) as it leads to arbitrary code execution by remote (possibly unauthenticated) attackers.

A remote attacker could craft a malicious HTTP request to any React Server Function endpoint that, when deserialized by React, achieves arbitrary code execution on the server.
The exploitation success rate is reported to be nearly 100% in default configurations.

While initially no proof of concept exploits for the vulnerability was available, On December 4th a full remote code execution exploit & technical analysis has been made public - https://github.com/msanft/CVE-2025-55182. This makes the vulnerability extremely likely to be used by external attackers.

## Who is vulnerable to React2Shell?

### React servers that use React Server Function endpoints
React servers that use **React Server Function endpoints** are known to be vulnerable. It is possible to check React Server applications for this vulnerable functionality by looking for the `use server;` directive in any of the application's source code files, which signifies a [Server Function](https://react.dev/reference/rsc/server-functions) is defined.

For example -

```javascript
async function requestUsername(formData) {
  'use server';
  const username = formData.get('username');
  // ...
}

export default function App() {
  return (
    <form action={requestUsername}>
      <input type="text" name="username" />
      <button type="submit">Request</button>
    </form>
  );
}
```



### React servers that support React Server Components

[React's advisory](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) states "Even if your app does not implement any React Server Function endpoints it may still be vulnerable if your app supports React Server Components.".

It is currently unclear what are the exact conditions that allow exploitation of CVE-2025-55182 when React Server Function endpoints are not used, but React Server Components are supported.

If your application supports React Server Components in any way, we highly recommend upgrading the vulnerable components to one of the fixed versions (see table below).

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

* **Next.js apps** - In cases where App Router functionality is not heavily used, the web application may be migrated back to using the Pages Router by following the [Next.js App Router migration guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration)



## How can I track React2Shell?
### Using the JFrog Platform

* The vulnerabilities are tracked in Xray as **XRAY-900398** & **XRAY-900476**.

* Xray's Catalog provides comprehensive visibility by automatically detecting all vulnerable React/Next.js packages and offering prioritized remediation paths using fixed version data.

  ![](/img/RealTimePostImage/react2shell/Catalog1.png)

* JFrog Advanced Security users can view Contextual analysis results for CVE-2025-55182 & CVE-2025-66478 -

  ![](/img/RealTimePostImage/react2shell/Contextual1.png)



### Dynamically - Using an open-source scanner

We recommend looking for vulnerable web applications dynamically with the following scanner - https://github.com/assetnote/react2shell-scanner
"The scanner sends a crafted multipart POST request that triggers a specific error condition in vulnerable versions of React Server Components. Vulnerable hosts return a 500 status code with `E{"digest"` in the response body. This check differentiates vulnerable hosts from those that are simply running RSC."

