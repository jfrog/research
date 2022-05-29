---
description: CVE-2022-1929 Medium severity. Exponential ReDoS in devcert leads to denial of service
title: devcert ReDoS
date_published: "2022-05-30"
last_updated: "2022-05-30"
xray_id: XRAY-211352
vul_id: CVE-2022-1929
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Exponential ReDoS in devcert leads to denial of service

## Component

[devcert](https://www.npmjs.com/package/devcert)

## Affected versions

devcert (,1.2.0], fixed in 1.2.1

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the devcert npm package, when an attacker is able to supply arbitrary input to the `certificateFor` method

## PoC

`'0' + '000'.repeat(i) + '\\x00'`

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-1929)