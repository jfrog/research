---
description: CVE-2025-6515, MEDIUM, oatpp-mcp prompt hijacking
title: oatpp-mcp prompt hijacking
date_published: "2025-10-20"
last_updated: "2025-10-20"
xray_id: JFSA-2025-001494691
vul_id: CVE-2025-6515
cvss: 6.8
severity: medium
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Reuse of session IDs in oatpp-mcp leads to session hijacking and prompt hijacking by remote attackers

## Component

oatpp:oatpp-mcp

## Affected versions

(,)

## Description

The MCP SSE endpoint in oatpp-mcp returns an instance pointer as the session ID, which is not unique nor cryptographically secure. This allows network attackers with access to the oatpp-mcp server to guess future session IDs and hijack legitimate client MCP sessions, returning malicious responses from the oatpp-mcp server. 

## PoC

No PoC is supplied for this vulnerability 

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[JFrog Technical Blog](https://jfrog.com/blog/mcp-prompt-hijacking-vulnerability)
