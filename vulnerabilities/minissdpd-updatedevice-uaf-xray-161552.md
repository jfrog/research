---
description: CVE-2019-12106 High severity. The updateDevice function in MiniSSDPd allows a remote attacker to crash the process due to a Use-After-Free
title:  MiniSSDPd updateDevice UaF
date_published: "2019-02-06"
last_updated: "2019-02-06"
xray_id: XRAY-161552
vul_id: CVE-2019-12106
cvss: 7.5
severity: high
discovered_by: Ben Barnea
type: vulnerability
---
## Summary
The updateDevice function in MiniSSDPd allows a remote attacker to crash the process due to a Use-After-Free

## Component

[MiniUPnP](http://miniupnp.free.fr/)

## Affected versions

MiniUPnP (,2.1], fixed in 2.2.0

## Description

It was discovered that there was a use after free vulnerability in
minissdpd, a network device discovery daemon. A remote attacker could
abuse this to crash the process.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References


[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-12106)


[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-12106)