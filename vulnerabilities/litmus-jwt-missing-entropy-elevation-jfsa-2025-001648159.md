---
description: CVE-2025-14261, HIGH, Lack of entropy allows registered low-privileged users of Litmus to crack valid JWT tokens and gain admin privileges
title: Litmus Chaos JWT Missing Entropy Privilege Escalation
date_published: "2025-12-08"
last_updated: "2025-12-08"
xray_id: JFSA-2025-001648159
vul_id: CVE-2025-14261
cvss: 7.1
severity: high
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Lack of entropy allows registered low-privileged users of Litmus to crack valid JWT tokens and gain admin privileges

## Component

Litmuschaos:litmus

## Affected versions

(,3.23.0)

## Description

The Litmus platform uses JWT for authentication and authorization, but the secret being used for signing the JWT is only 6 bytes long at its core, which makes it extremely easy to crack.


## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Fix PR](https://github.com/litmuschaos/litmus/pull/5324)

