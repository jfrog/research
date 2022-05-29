---
description: CVE-2021-43306 Medium severity. Exponential ReDoS in jquery-validation leads to denial of service
title: jquery-validation ReDoS
date_published: "2022-05-30"
last_updated: "2022-05-30"
xray_id: XRAY-211348
vul_id: CVE-2021-43306
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Exponential ReDoS in jquery-validation leads to denial of service

## Component

[jquery-validation](https://www.npmjs.com/package/jquery-validation)

## Affected versions

jquery-validation (,1.19.3], fixed in 1.19.4

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the jquery-validation npm package, when an attacker is able to supply arbitrary input to the `url2` method

## PoC

`'[FTP://0](ftp://0.0.0.0/).' + '3.3.'.repeat(10) + '\x00'`

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43306)