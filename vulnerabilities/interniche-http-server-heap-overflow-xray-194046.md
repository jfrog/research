---
description: CVE-2021-31226 Critical severity. Heap overflow in InterNiche TCP/IP stack's HTTP server leads to remote code execution when sending a crafted HTTP POST request
title: InterNiche HTTP server heap overflow
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194046
vul_id: CVE-2021-31226
cvss: 9.8
severity: critical
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Heap overflow in InterNiche TCP/IP stack's HTTP server leads to remote code execution when sending a crafted HTTP POST request

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

NicheStack (also known as InterNiche stack) is a proprietary TCP/IP stack developed originally by InterNiche Technologies and acquired by HCC Embedded in 2016. A heap-based buffer overflow was discovered when the NicheStack HTTP server parses HTTP POST packets. CVE-2021-31226 occurs during the parsing of the HTTP Request URI field in the function `ht_readmsg`. After making sure the packet has a valid `Content-Length` header value, the parsing logic gets the pointer to the request URI (`requri`) by calling `ht_nextarg` on the HTTP request’s buffer and stores this pointer in the `header_struct->fi->requri`. A request URI string larger than 52 bytes will overflow into the fixed-size heap buffer via a vulnerable strcpy call. Note that the HTTP server is optional, and may be disabled or compiled-out entirely.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If not needed, disable the NicheStack HTTP server through the NicheStack CLI

## References

[(JFrog) INFRA:HALT New Vulnerabilities Impacting OT and Critical Infrastructure](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-31226)