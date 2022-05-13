---
description: CVE-2020-35683 High severity. NicheStack ICMP IP payload size read out of bounds
title: NicheStack ICMP payload OOB-R
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194052
vul_id: CVE-2020-35683
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack ICMP IP payload size read out of bounds

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

NicheStack code that parses ICMP packets relies on an unchecked value of the IP payload size (extracted from the IP header) to compute the ICMP checksum. When the IP payload size is set to be smaller than the size of the IP header, the ICMP checksum computation function may read out of bounds

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) INFRA:HALT New Vulnerabilities Impacting OT and Critical Infrastructure](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2020-35683)