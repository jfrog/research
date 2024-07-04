---
description: CVE-2024-6507, HIGH, Command injection when ingesting a remote Kaggle dataset due to a lack of input sanitization in the ingest_kaggle() API
title: Deep Lake Kaggle dataset command injection
date_published: "2024-07-04"
last_updated: "2024-07-04"
xray_id: JFSA-2024-001035320
vul_id: CVE-2024-6507
cvss: 8.1
severity: high
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Command injection when ingesting a remote Kaggle dataset due to a lack of input sanitization in the ingest_kaggle() API

## Component

[deeplake](https://pypi.org/project/deeplake/)

## Affected versions

(,3.9.10]

## Description

Deep Lake can be used for storing data and vectors while building LLM applications or to manage datasets while training deep learning models.
Datasets can be loaded from various external sources, such as the Kaggle platform.
In order to load an external Kaggle dataset a user will use the exported `ingest_kaggle` method.

The method will receive the `tag` parameter which should indicate the Kaggle dataset tag.

The `tag` parameter propagates into the `_exec_command` method without any form of input filtering.

Due to this issue, if a user builds an external facing application based on the Deep Lake application with the ability to upload Kaggle datasets, an attacker will be able to perform a remote code execution attack on the server, compromising all integrity, availability, and confidentiality of the available resources.



## PoC

```python
import deeplake

deeplake.ingest_kaggle('some/text||touch /tmp/hacked','/tmp/somepath','./tmp/somepath2',kagg
le_credentials={"username":"mister","key":"john","password":"doe"},overwrite=True)
```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Vendor fix](https://github.com/activeloopai/deeplake/pull/2876)

