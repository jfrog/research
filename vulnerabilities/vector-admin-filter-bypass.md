---
description: CVE-2024-0879, MEDIUM, Authentication bypass in vector-admin allows a user to register to a vector-admin server while “domain restriction” is active, even when not owning an authorized email address.
title: VectorAdmin domain restriction authentication bypass 
date_published: "2024-01-25"
last_updated: "2024-01-25"
xray_id: JFSA-2024-000510085
vul_id: CVE-2024-0879
cvss: 6.5
severity: medium
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Authentication bypass in vector-admin allows a user to register to a vector-admin server while “domain restriction” is active, even when not owning an authorized email address.

## Component

[vector-admin](https://github.com/Mintplex-Labs/vector-admin)



## Affected versions

No version tags. Fixed in commit [a581b81](https://github.com/Mintplex-Labs/vector-admin/pull/128/commits/a581b8177dd6be719a5ef6d3ce4b1e939636bb41)



## Description

The admin user in the vector-admin server can define a list of domains which will prevent anyuser who does not own an email address under those domains from registering to the server.
The registration portal itself does not require any other form of authentication except being from a registered domain.

The domain restriction check is being performed via the “includes” function, which only checks if a certain string is present on a supplied input, not if the string is a prefix or suffix.



## PoC

No PoC is supplied for this issue



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix commit](https://github.com/Mintplex-Labs/vector-admin/pull/128/commits/a581b8177dd6be719a5ef6d3ce4b1e939636bb41)
