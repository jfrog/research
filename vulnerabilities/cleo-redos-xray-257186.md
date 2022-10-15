---
description: CVE-2022-42966 Medium severity. Exponential ReDoS in cleo leads to denial of service
title: cleo ReDoS
date_published: "2022-10-15"
last_updated: "2022-10-15"
xray_id: XRAY-257186
vul_id: CVE-2022-42966
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability

---

## Summary

Exponential ReDoS in cleo leads to denial of service

## Component

[cleo](https://pypi.org/project/cleo)

## Affected versions

cleo (,)

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the cleo PyPI package, when an attacker is able to supply arbitrary input to the `cleo` method

## PoC

No PoC is supplied for this issue



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-42966)