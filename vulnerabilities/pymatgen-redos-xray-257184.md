---
description: CVE-2022-42964 Medium severity. Exponential ReDoS in pymatgen leads to denial of service
title: pymatgen ReDoS
date_published: "2022-10-15"
last_updated: "2022-10-15"
xray_id: XRAY-257184
vul_id: CVE-2022-42964
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability

---

## Summary

Exponential ReDoS in pymatgen leads to denial of service

## Component

[pymatgen](https://pypi.org/project/pymatgen)

## Affected versions

pymatgen (,)

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the pymatgen PyPI package, when an attacker is able to supply arbitrary input to the `pymatgen` method

## PoC

No PoC is supplied for this issue



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-42964)