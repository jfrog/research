---
title: NicheStack TCP ISNs are generated in a predictable manner
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194054
vul_id: CVE-2020-35685
cvss: 9.1
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack TCP ISNs are generated in a predictable manner

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

An issue was discovered in HCC Nichestack 3.0. The code that generates Initial Sequence Numbers (ISNs) for TCP connections derives the ISN from an insufficiently random source. As a result, an attacker may be able to determine the ISN of current and future TCP connections and either hijack existing ones or spoof future ones. (Proper ISN generation should aim to follow at least the specifications outlined in RFC 6528.)

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)
