---
description: CVE-2021-43309 Medium severity. Exponential ReDoS in uri-template-lite leads to denial of service
title: uri-template-lite URI.expand ReDoS
date_published: "2022-08-03"
last_updated: "2022-08-03"
xray_id: XRAY-211351
vul_id: CVE-2021-43309
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Exponential ReDoS in uri-template-lite leads to denial of service

## Component

[uri-template-lite](https://www.npmjs.com/package/uri-template-list)

## Affected versions

uri-template-lite (,)

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the uri-template-lite npm package, when an attacker is able to supply arbitrary input to the `URI.expand()` method

The vulnerable regular expression can be found at "/package/index.js" - `\{([#&+.\/;?]?)((?:[-\w%.]+(\*|:\d+)?,?)+)\}`


## PoC

`'{0' + '0'.repeat(1000)`



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43309)