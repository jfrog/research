---
description: CVE-2022-32215 Medium severity. Improper handling of multi-line Transfer-Encoding headers in Node.js http server leads to HTTP request smuggling
title: Node.js llhttp HTTP smuggling
date_published: "2022-10-04"
last_updated: "2022-10-04"
xray_id: XRAY-231662
vul_id: CVE-2022-32215
cvss: 9.1
severity: medium
discovered_by: Zhang Zeyu, Liav Gutman
type: vulnerability
---
## Summary
Improper handling of multi-line Transfer-Encoding headers in Node.js http server leads to HTTP request smuggling

## Component

[Node.js](https://nodejs.org/en/)

## Affected versions

Node.js (, 14.20.0], (, 16.17.0], (, 18.9.0]. Fixed in 14.20.1, 16.17.1 and 18.9.1

Originally, the reported fixed versions were 14.14.0, 16.12.0 and 18.5.0. [But it has been discovered](https://hackerone.com/reports/1665156) that these versions did not fix the issue.

## Description

[NodeJS](https://nodejs.org/) is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser, which was designed to build scalable network applications.

Node.js contains an http server implementation, inside its `http` module. It was discovered that the http server may be vulnerable to [`HTTP request smuggling`](https://portswigger.net/web-security/request-smuggling) under certain scenarios.

The vulnerable scenario involves - 

* A back-end Node.js HTTP server (runs `http.createServer`)
* A front-end proxy that passes data to the Node.js HTTP server
* The front-end proxy is performing some security check on incoming HTTP data, before passing to the back-end

For example for the following request -
```
GET / HTTP/1.1
Transfer-Encoding: chunked
 , identity

1
a
0
```

Node.js handles multi-line header values incorrectly. An upstream proxy that correctly implements multi-line header values will see the `Transfer-Encoding` header as `chunked , identity`, and assume that due to the `identity` value, the content length is 0 (request body is empty).

On the other hand, due to the bug, the Node.js HTTP server will not process the `identity` value and treat the encoding as `chunked`, meaning that Node.js will see the `1` character as part of the request body.

This could lead to filter bypasses, in cases where the front-end proxy is not supposed to forward requests with a non-empty body.



## PoC

```
GET / HTTP/1.1
Transfer-Encoding: chunked
 , identity

1
a
0
```

(see description for full explanation)

## References

[Updated Hackerone Issue (JFrog)](https://hackerone.com/reports/1665156)

[Original Hackerone Issue](https://hackerone.com/reports/1501679)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-32215)