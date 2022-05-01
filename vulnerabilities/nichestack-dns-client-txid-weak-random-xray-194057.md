---
description: CVE-2020-25926 Medium severity. NicheStack DNS client does not set sufficiently random transaction IDs
title: NicheStack DNS client TXID weak random
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194057
vul_id: CVE-2020-25926
cvss: 7.5
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack DNS client does not set sufficiently random transaction IDs

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

The DNS client in InterNiche NicheStack TCP/IP 4.0.1 is affected by: Insufficient entropy in the DNS transaction id. The impact is: DNS cache poisoning (remote). The component is: dns_query_type(). The attack vector is: a specific DNS response packet.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) INFRA:HALT New Vulnerabilities Impacting OT and Critical Infrastructure](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)