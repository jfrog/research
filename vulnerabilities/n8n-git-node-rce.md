---
description: n8n users can achieve arbitrary code execution on the n8n host by adding a Git Node component
title: n8n Git Node RCE
date_published: "2025-11-04"
last_updated: "2025-11-04"
xray_id:
vul_id: CVE-2025-62726
cvss: 8.8
severity: high
discovered_by: Assaf Levkovich
type: vulnerability

---

## Summary

n8n users can achieve arbitrary code execution on the n8n host by adding a Git Node component

## Component

[n8n](https://www.npmjs.com/package/n8n)

## Affected versions

( , 1.113.0)

## Description

A remote code execution vulnerability exists in the Git Node component available in both Cloud and Self-Hosted versions of n8n. When a malicious actor clones a remote repository containing a pre-commit hook, the subsequent use of the Commit operation in the Git Node can inadvertently trigger the hook’s execution.

This allows attackers to execute arbitrary code within the n8n environment, potentially compromising the system and any connected credentials or workflows.



## PoC

Create a Git Node with a "Clone Operation" using the following source repository - https://github.com/assaf-levkovich-jf/n8n-repo-test.git

Observe that the Output panel now includes the results of the pre-commit hook command (for POC purposes, the command simply echos the environment variables keys, but not the values)

![n8n-git-node-poc](https://lh3.googleusercontent.com/d/1I3jqZk-8yS1No8bRgpbWh1mMiCnHRCuA)

## Vulnerability Mitigations

Disable or restrict the use of the Git Node in workflows where repository content cannot be fully trusted.

## References

[Advisory](https://github.com/n8n-io/n8n/security/advisories/GHSA-xgp7-7qjq-vg47)
