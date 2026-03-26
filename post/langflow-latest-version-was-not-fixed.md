---
excerpt: "The JFrog Security Research team has identified that Langflow version 1.8.2, which is widely reported as patched for CVE-2026-33017, remains vulnerable to remote code execution"
title: "Langflow CVE-2026-33017: Latest 'fixed' version is still exploitable"
date: "March 26, 2026"
description: "Aviv Engelberg and Ofri Ouzan, JFrog Security Researchers"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '6'

---
**TL;DR**

- Langflow CVE-2026-33017 is actively exploited and listed in CISA KEV  
- Public sources claim the latest version, 1.8.2, is patched  
- In reality, the vulnerability is still exploitable in 1.8.2
- Actual fixed version (1.9.0) is not yet available
- This was verified using a public PoC, on both the langflow PyPI package and official Docker image  
- This creates a dangerous gap between perceived security and actual security
- JFrog alerted the maintainers, which fixed the affected versions in GitHub Advisory Database 

The JFrog Security Research team has identified that [Langflow](https://github.com/langflow-ai/langflow) version 1.8.2, **which is widely reported as patched for CVE-2026-33017, remains vulnerable to remote code execution**, creating a dangerous gap between perceived and actual security. 
We would like to thank the Langflow maintainers for very quickly fixing the range of affected versions after our disclosure to them.

# Understanding the Vulnerability

CVE-2026-33017 is a remote code execution vulnerability with a CVSS score of 9.8 (Critical), and its inclusion in the [CISA KEV](https://www.cisa.gov/news-events/alerts/2026/03/25/cisa-adds-one-known-exploited-vulnerability-catalog#:~:text=CVE%2D2026%2D33017%20Langflow%20Code%20Injection%20Vulnerability) confirms that it is actively exploited in the wild.

The issue stems from unsafe handling of user-controlled input in the `build_public_tmp` endpoint, where user input is executed within a Python context without sufficient sanitization or validation. This allows attackers to inject and execute arbitrary code on the server.

Successful exploitation allows unauthenticated attackers to:

- Execute arbitrary code on the server  
- Access sensitive data  
- Pivot to compromise additional infrastructure

Because Langflow is often deployed in cloud and containerized environments such as AWS EC2 and Kubernetes, the real-world impact of this vulnerability is significant and extends beyond a single service into broader infrastructure risk.

# The Confusion

While version 1.8.2 is currently the latest official release of Langflow, the [changelog](https://github.com/langflow-ai/langflow/releases#:~:text=fix%3A%20prevent%20RCE%20via%20data%20parameter%20in%20build_public_tmp%20endpoint%20by%20%40Jkavia%20in%20%2312160) gives the impression that this vulnerability has been fixed in that version.

As shown below, the release notes explicitly mention a fix for the RCE vulnerability:  
![](/img/RealTimePostImage/post/langflow-vulnerability/image1.png)

In addition to the maintainer’s statement, multiple external sources also report that version 1.8.2 is patched. For example, the [National Vulnerability Database](https://nvd.nist.gov/vuln/detail/CVE-2026-33017) indicates that all versions except 1.8.2 are vulnerable:  
![](/img/RealTimePostImage/post/langflow-vulnerability/image2.png)

Similarly, the [GitHub advisory system](https://github.com/advisories/GHSA-vwmf-pq79-vjvx) reports that version 1.8.2 includes the fix:  
![](/img/RealTimePostImage/post/langflow-vulnerability/image3.png)

However, at the same time, the maintainer's [GitHub advisory](https://github.com/langflow-ai/langflow/security/advisories/GHSA-vwmf-pq79-vjvx), states that patched versions are 1.9.0 and above, even though version 1.9.0 has not been officially released.  
![](/img/RealTimePostImage/post/langflow-vulnerability/image4.png)

This contradiction creates significant confusion for Langflow users, who are left trying to determine which source to trust.

The confusion is further demonstrated by the following [issue](https://github.com/langflow-ai/langflow/issues/12312), that was opened yesterday where users explicitly requested a Docker image for version 1.8.2 so they could upgrade to what they believed was a safe version:  
![](/img/RealTimePostImage/post/langflow-vulnerability/image5.png)

Shortly after, a [Docker image](https://hub.docker.com/layers/langflowai/langflow/1.8.2/images/sha256-942d179f733ffbeb4c80e509233067bb771ec4d0afb72082f3e7ca615c6fa238) for version 1.8.2 was released, reinforcing the assumption that this version is secure and ready for production use.  
![](/img/RealTimePostImage/post/langflow-vulnerability/image6.png)

# The Exploit

These inconsistencies led us to a straightforward but critical question: where is the actual fix?

After reviewing the commits of version 1.8.2, we were unable to identify the patch that supposedly addressed the vulnerability. This led us to validate the fix empirically by testing the publicly available PoC:

- [langflow-CVE-2026-33017-poc](https://github.com/MaxMnMl/langflow-CVE-2026-33017-poc)

We executed the PoC against Langflow version 1.8.2 in both PyPI and Docker environments.  
As shown below, the exploit successfully triggers remote code execution:  
![](/img/RealTimePostImage/post/langflow-vulnerability/image7.png)

**This confirms that version 1.8.2 is still vulnerable.**

Both installation methods, PyPI and Docker, resulted in successful exploitation, clearly demonstrating that the vulnerability is not fixed in this version.

After opening an issue and [pr](https://github.com/github/advisory-database/pull/7242) to LangFlow with all details, it was confirmed that version 1.9.0 is the correct patched version, which means 1.8.2 is indeed vulnerable.  
![](/img/RealTimePostImage/post/langflow-vulnerability/image8.png)

# Affected Versions

## langflow

All official released versions are affected.

- 1.9.0 (to be released) includes a patch.

## langflow-base

All official released versions are affected.

- 0.9.0 (to be released) includes a patch.

# Remediation

At the moment, since there is no official LangFlow patched version released, we recommend uninstalling LangFlow and installing langflow-nightly instead.

Our testing shows that the mitigation implemented in langflow-nightly 1.9.0.dev18 is effective, with the PoC failing to achieve code execution.

```shell
pip uninstall langflow
pip install langflow-nightly
```

# Conclusion

The case of CVE-2026-33017 in Langflow highlights a fundamental truth in modern software security: security cannot be determined solely by what external sources claim, but only by verifying how the code behaves in practice.
This incident reinforces the importance of independent validation and dedicated security research in ensuring that “fixed” truly means fixed.
