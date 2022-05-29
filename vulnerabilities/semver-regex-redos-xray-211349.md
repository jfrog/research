---
description: CVE-2021-43307 Medium severity. Exponential ReDoS in semver-regex leads to denial of service
title: semver-regex ReDoS
date_published: "2022-05-30"
last_updated: "2022-05-30"
xray_id: XRAY-211349
vul_id: CVE-2021-43307
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Exponential ReDoS in semver-regex leads to denial of service

## Component

[semver-regex](https://www.npmjs.com/package/semver-regex)

## Affected versions

semver-regex (,3.1.3]|[4.0.0,4.0.2], fixed in 3.1.4 and 4.0.3

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the semver-regex npm package, when an attacker is able to supply arbitrary input to the `test` method

## PoC

`'0.0.1-' + '-.--'.repeat(i) + ' '`

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43307)