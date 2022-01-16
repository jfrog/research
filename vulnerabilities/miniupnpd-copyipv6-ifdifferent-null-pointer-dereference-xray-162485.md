---
title: MiniUPnPd copyIPv6IfDifferent NULL pointer dereference
date_published: "2019-02-06"
last_updated: "2019-02-06"
xray_id: XRAY-162485
vul_id: CVE-2019-12111
cvss: 7.5
severity: high
discovered_by: Ben Barnea
type: vulnerability
---
## Summary
Denial Of Service in MiniUPnPd due to a NULL pointer dereference in pcpserver.c

## Component

[MiniUPnP](http://miniupnp.free.fr/)

## Affected versions

MiniUPnP (,2.1], fixed in 2.2.0

## Description

It was discovered that MiniUPnPd did not properly parse certain PCP
requests. An attacker could possibly use this issue to cause MiniUPnPd to
crash, resulting in a denial of service.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-12111)
