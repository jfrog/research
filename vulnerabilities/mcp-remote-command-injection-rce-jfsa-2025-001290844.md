---
description: CVE-2025-6514, CRITICAL, OS command injection in mcp-remote when connecting to untrusted MCP servers
title: OS command injection in mcp-remote when connecting to untrusted MCP servers
date_published: "2025-07-09"
last_updated: "2025-07-09"
xray_id: JFSA-2025-001290844
vul_id: CVE-2025-6514
cvss: 9.6
severity: critical
discovered_by: Or Peles
type: vulnerability

---

## Summary

OS command injection in mcp-remote when connecting to untrusted MCP servers

## Component

[mcp-remote](https://www.npmjs.com/package/mcp-remote)



## Affected versions

[0.0.5, 0.1.15]

## Description

mcp-remote is exposed to OS command injection when connecting to untrusted MCP servers due to crafted input from the `authorization_endpoint` response URL



## PoC

The vulnerability can be triggered by a malicious MCP server that provides the following `authorization_endpoint` URL -

```
file:/c:/windows/system32/calc.exe
```





## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix commit](https://github.com/geelen/mcp-remote/commit/607b226a356cb61a239ffaba2fb3db1c9dea4bac)

[JFrog Research Blog](https://jfrog.com/blog/2025-6514-critical-mcp-remote-rce-vulnerability)

