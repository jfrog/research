---
description: CVE-2021-43308 Medium severity. Exponential ReDoS in markdown-link-extractor leads to denial of service
title: markdown-link-extractor ReDoS
date_published: "2022-05-30"
last_updated: "2022-05-30"
xray_id: XRAY-211350
vul_id: CVE-2021-43308
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Exponential ReDoS in markdown-link-extractor leads to denial of service

## Component

[markdown-link-extractor](https://www.npmjs.com/package/markdown-link-extractor)

## Affected versions

markdown-link-extractor (,3.0.1]|[4.0.0], fixed in 3.0.2 and 4.0.1

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the markdown-link-extractor npm package, when an attacker is able to supply arbitrary input to the module's exported function

## PoC

`'![' + '"\\\\"'.repeat(i))`

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43308)