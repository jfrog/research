---
title: NicheStack DNS client does not set sufficiently random source ports
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194058
vul_id: CVE-2021-31228
cvss: 7.5
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack DNS client does not set sufficiently random source ports

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

An issue was discovered in HCC embedded InterNiche 4.0.1. This vulnerability allows the attacker to predict a DNS query's source port in order to send forged DNS response packets that will be accepted as valid answers to the DNS client's requests (without sniffing the specific request). Data is predictable because it is based on the time of day, and has too few bits.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)
