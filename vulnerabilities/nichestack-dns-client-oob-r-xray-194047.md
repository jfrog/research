---
description: CVE-2020-25767 High severity. The NicheStack routine for parsing DNS domain names does not check whether a compression pointer points within the bounds of a packet, which leads to OOB-R
title: NicheStack DNS client OOB-R
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194047
vul_id: CVE-2020-25767
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
The NicheStack routine for parsing DNS domain names does not check whether a compression pointer points within the bounds of a packet, which leads to OOB-R

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

An issue was discovered in HCC Embedded NicheStack IPv4 4.1. The dnc_copy_in routine for parsing DNS domain names does not check whether a domain name compression pointer is pointing within the bounds of the packet (e.g., forward compression pointer jumps are allowed), which leads to an Out-of-bounds Read, and a Denial-of-Service as a consequence.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If not needed, disable the NicheStack DNS client through the NicheStack CLI

## References

[JFrog Blogpost](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)
