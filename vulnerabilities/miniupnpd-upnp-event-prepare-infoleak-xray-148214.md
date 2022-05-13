---
description: CVE-2019-12107 High severity. Information leakage in MiniUPnPd due to improper validation of snprintf return value
title: MiniUPnPd upnp_event_prepare infoleak
date_published: "2019-02-06"
last_updated: "2019-02-06"
xray_id: XRAY-148214
vul_id: CVE-2019-12107
cvss: 7.5
severity: high
discovered_by: Ben Barnea
type: vulnerability
---
## Summary
Information leakage in MiniUPnPd due to improper validation of snprintf return value

## Component

[MiniUPnP](http://miniupnp.free.fr/)

## Affected versions

MiniUPnP (,2.1], fixed in 2.2.0

## Description

It was discovered that MiniUPnPd did not properly validate callback
addresses. A remote attacker could possibly use this issue to expose
sensitive information.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References


[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-12107)


[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-12107)