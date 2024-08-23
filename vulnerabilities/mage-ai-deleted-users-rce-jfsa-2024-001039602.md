---
description: CVE-2024-45187, HIGH, Mage AI deleted users RCE
title: Mage AI deleted users RCE
date_published: "2024-08-23"
last_updated: "2024-08-23"
xray_id: JFSA-2024-001039602
vul_id: CVE-2024-45187
cvss: 7.1
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Mage AI allows deleted users to use the terminal server with admin access, leading to remote code execution

## Component

mage-ai

## Affected versions

(,)

## Description

Guest users in the Mage AI framework that remain logged in after their accounts are deleted, are mistakenly given high privileges and specifically given access to remotely execute arbitrary code through the Mage AI terminal server

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

No references are supplied for this issue

