---
description: CVE-2024-6960, HIGH, H2O Model Deserialization RCE
title: H2O Model Deserialization RCE
date_published: "2024-07-21"
last_updated: "2024-07-21"
xray_id: JFSA-2024-001035518
vul_id: CVE-2024-6960
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

H2O deserializes ML models without filtering, potentially allowing execution of malicious code



## Component

[h2o-core](https://mvnrepository.com/artifact/ai.h2o/h2o-core)



## Affected versions

(,)

## Description

The H2O machine learning platform uses "Iced" classes as the primary means of moving Java Objects around the cluster. The Iced format supports inclusion of serialized Java objects. When a model is deserialized, any class is allowed to be deserialized (no class whitelist). An attacker can construct a crafted Iced model that uses Java gadgets and leads to arbitrary code execution when imported to the H2O platform.



## PoC

An appropriate malicious serialized object can be created with the [ysoserial](https://github.com/frohoff/ysoserial/tree/master) tool, using the `CommonsBeanutils1` payload.

The serialized binary can then be embedded within an Iced model in the proper format.

Loading the model using the Web UI's "Import Model" command (or an equivalent API) will trigger code execution



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

No references are supplied for this issue

