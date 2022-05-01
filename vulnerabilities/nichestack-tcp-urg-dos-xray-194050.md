---
description: CVE-2021-31400 High severity. NicheStack TCP out-of-band urgent data processing DoS
title: NicheStack TCP URG DoS
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194050
vul_id: CVE-2021-31400
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack TCP out-of-band urgent data processing DoS

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

NicheStack TCP out-of-band urgent data processing function invokes a panic function if the pointer to the end of the out-of-band urgent data points out of the TCP segment’s data, which results in DoS (either an infinite loop or interrupt thrown, depending on NicheStack version)

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) INFRA:HALT New Vulnerabilities Impacting OT and Critical Infrastructure](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)