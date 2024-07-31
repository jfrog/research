---
description: CVE-2024-7340, HIGH, W&B Weave server remote arbitrary file leak
title: W&B Weave server remote arbitrary file leak
date_published: "2024-07-31"
last_updated: "2024-07-31"
xray_id: JFSA-2024-001039248
vul_id: CVE-2024-7340
cvss: 8.8
severity: high
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

W&B Weave server remote arbitrary file leak and privilege escalation

## Component

weave

## Affected versions

(,0.50.7]

## Description

The Weave server API allows remote users to fetch files from a specific directory, but due to a lack of input validation, it is possible to traverse and leak arbitrary files remotely. In various common scenarios, this allows a low-privileged user to assume the role of the server admin.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Vendor fix](https://github.com/wandb/weave/pull/1657)

