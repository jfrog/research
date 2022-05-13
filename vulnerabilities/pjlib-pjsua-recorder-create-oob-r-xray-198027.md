---
description: CVE-2021-43302 Medium severity. Read out-of-bounds in PJSUA leads to denial of service
title: PJLIB pjsua_recorder_create OOB-R
date_published: "2022-03-01"
last_updated: "2022-03-01"
xray_id: XRAY-198027
vul_id: CVE-2021-43302
cvss: 5.9
severity: medium 
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Read out-of-bounds in PJLIB leads to denial of service when invoking `pjsua_recorder_create` with malicious input.

## Component

[PJLIB](https://www.pjsip.org/pjlib/docs/html/)

## Affected versions

PJLIB (, 2.1.11], fixed in 2.12

## Description

CVE-2021-43302 was found in `pjsua_recorder_create` (OO wrapper - `AudioMediaRecorder::createRecorder`) which creates a file recorder and automatically connects this recorder to the conference bridge. 

Attackers that can remotely control the contents of the `filename` argument of `pjsua_recorder_create` may cause a denial of service.

This function contains a read out of bounds vulnerability since it does not check if the length of `filename` is at least 4. If `filename` is shorter than 4, `pj_stricmp2` will cause a read out-of-bounds in a string comparison operation.

## PoC

No PoC is supplied for this vulnerability.

## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading PJSIP to version 2.12.

## References

[(JFrog) 5 New Vulnerabilities Discovered in PJSIP Open Source Library](https://jfrog.com/blog/jfrog-discloses-5-memory-corruption-vulnerabilities-in-pjsip-a-popular-multimedia-library/)
[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43302)