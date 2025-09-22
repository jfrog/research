---
description: CVE-2025-10854, HIGH, txtai arbitrary file write
title: txtai arbitrary file write
date_published: "2025-09-22"
last_updated: "2025-09-22"
xray_id: JFSA-2025-001471363
vul_id: CVE-2025-10854
cvss: 8.1
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Symlink Following in txtai leads to arbitrary file write when loading untrusted embedding indices

## Component

txtai

## Affected versions

(,9.0.0]

## Description

The txtai framework allows the loading of compressed tar files as embedding indices. While the validate function is intended to prevent path traversal vulnerabilities by ensuring safe filenames, it does not account for symbolic links within the tar file. An attacker is able to write a file anywhere in the filesystem when txtai is used to load untrusted embedding indices 


## PoC

The following txtai code is vulnerable, when loading a tar file that contains symbolic links -

```python
from txtai import Embeddings 
embeddings = Embeddings() 
embeddings.load(path="/tmp/bad_tar.tar.gz") 
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Fix PR](https://github.com/neuml/txtai/issues/965)

