---
description: CVE-2022-29167 Medium severity. Exponential ReDoS in hawk leads to denial of service
title: hawk ReDoS
date_published: "2022-05-30"
last_updated: "2022-05-30"
xray_id: XRAY-209780
vul_id: CVE-2022-29167
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Exponential ReDoS in hawk leads to denial of service

## Component

[hawk](https://www.npmjs.com/package/hawk)

## Affected versions

hawk (,9.0.1), fixed in 9.0.1

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the hawk npm package, when an attacker is able to supply arbitrary input to the `Hawk.utils.parseHost` method

## PoC

`'\t:0\r\n' + '\t\r\n\t\r\n'.repeat(i) + '\rA'`

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-29167)