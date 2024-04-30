---
description: CVE-2024-4340, HIGH, Passing a heavily nested list to sqlparse.parse() leads to a Denial of Service due to RecursionError.
title: sqlparse stack exhaustion DoS
date_published: "2024-04-30"
last_updated: "2024-04-30"
xray_id: JFSA-2024-001031292
vul_id: CVE-2024-4340
cvss: 7.5
severity: High
discovered_by: Uriya Yavnieli
type: vulnerability

---

## Summary

Passing a heavily nested list to sqlparse.parse() leads to a Denial of Service due to RecursionError.

## Component

sqlparse

## Affected versions

(,0.5.0)

## Description

Passing a heavily nested list to sqlparse.parse() leads to a Denial of Service due to RecursionError.

## PoC

Running the following code will raise Maximum recursion limit exceeded exception:

```python
import sqlparse
sqlparse.parse('[' * 10000 + ']' * 10000)
```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix commit](https://github.com/andialbrecht/sqlparse/commit/b4a39d9850969b4e1d6940d32094ee0b42a2cf03)

[GHSA Advisory](https://github.com/advisories/GHSA-2m57-hf25-phgg)

