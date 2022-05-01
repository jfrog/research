---
description: CVE-2020-25927 High severity. NicheStack routine for parsing DNS responses does not check whether the number of queries/responses specified in the packet header corresponds to the query/response data available in the DNS packet, leading to OOB-R
title: NicheStack DNS client OOB-R
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194048
vul_id: CVE-2020-25927
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack routine for parsing DNS responses does not check whether the number of queries/responses specified in the packet header corresponds to the query/response data available in the DNS packet, leading to OOB-R

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

The DNS feature in InterNiche NicheStack TCP/IP 4.0.1 is affected by: Out-of-bounds Read. The impact is: a denial of service (remote). The component is: DNS response processing in function: dns_upcall(). The attack vector is: a specific DNS response packet. The code does not check whether the number of queries/responses specified in the DNS packet header corresponds to the query/response data available in the DNS packet.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If not needed, disable the NicheStack DNS client through the NicheStack CLI

## References

[(JFrog) INFRA:HALT New Vulnerabilities Impacting OT and Critical Infrastructure](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)