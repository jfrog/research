---
description: Using Cursor CLI inside a malicious repository leads to Remote Code Execution on the end-user.
title: Cursor CLI Untrusted Project RCE
date_published: "2025-11-04"
last_updated: "2025-11-04"
xray_id:
vul_id: CVE-2025-61592
cvss: 8.8
severity: high
discovered_by: Assaf Levkovich
type: vulnerability

---

## Summary

Using Cursor CLI inside a malicious repository leads to Remote Code Execution on the end-user.

## Component

[Cursor CLI](https://github.com/cursor/cursor)

## Affected versions

( , 2025.09.17-25b418f)

## Description

Due to automatic loading of project-specific CLI configuration that affected certain global configurations under the current working directory (`<project>/.cursor/cli.json`) while using Cursor CLI, users running the CLI inside a malicious repo context are prone to Remote Code Execution via a combination of permissive configuration (allowed shell commands) and prompt injection delivered via project specific Rules (`<project>/.cursor/rules/rule.mdc`) or other mechanisms.

The most likely exploitation vector for this issue, is for Cursor CLI users to clone a malicious Git repository and then run any query inside the cloned repository.



## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No mitigations are available for this issue

## References

[Advisory](https://github.com/cursor/cursor/security/advisories/GHSA-v64q-396f-7m79)
