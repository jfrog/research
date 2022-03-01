---
description: CVE-2021-43300 High severity. Stack overflow in PJSUA leads to remote code execution
title: PJLIB pjsua_recorder_create RCE
date_published: "2022-03-01"
last_updated: "2022-03-01"
xray_id: XRAY-198025
vul_id: CVE-2021-43300
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Stack overflow in PJLIB leads to remote code execution when invoking `pjsua_recorder_create` with malicious input

## Component

[PJLIB](https://www.pjsip.org/pjlib/docs/html/)

## Affected versions

PJLIB (, 2.1.11], fixed in 2.12

## Description

CVE-2021-43300 was found in `pjsua_recorder_create` (OO wrapper - `AudioMediaRecorder::createRecorder`) which creates a file recorder and automatically connects this recorder to the conference bridge. 

Attackers that can remotely control the contents of the `filename` argument of `pjsua_recorder_create` may cause remote code execution.

This function contains a stack overflow vulnerability when `filename->ptr` is being copied via `memcpy` to the `path` stack variable without checking that `filename->slen` is at most the `path` allocated size which is `PJ_MAXPATH` (260).

## PoC

No PoC is supplied for this vulnerability.

## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading PJSIP to version 2.12.

## References

[JFrog Blogpost](https://jfrog.com/blog/jfrog-discloses-5-memory-corruption-vulnerabilities-in-pjsip-a-popular-multimedia-library/)
