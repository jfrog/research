---
title: NicheStack IP length DoS
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194051
vul_id: CVE-2021-31401
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack TCP header IP length integer overflow leads to DoS

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

NicheStack TCP header processing code doesn’t sanitize the length of the IP length (header + data). With a crafted IP packet an integer overflow would occur whenever the length of the IP data is calculated by subtracting the length of the header from the length of the total IP packet

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)
