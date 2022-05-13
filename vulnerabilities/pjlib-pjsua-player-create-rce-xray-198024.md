---
description: CVE-2021-43299 High severity. Stack overflow in PJSUA leads to remote code execution
title: PJLIB pjsua_player_create RCE
date_published: "2022-03-01"
last_updated: "2022-03-01"
xray_id: XRAY-198024
vul_id: CVE-2021-43299
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Stack overflow in PJLIB leads to remote code execution when invoking `pjsua_player_create` with malicious input

## Component

[PJLIB](https://www.pjsip.org/pjlib/docs/html/)

## Affected versions

PJLIB (, 2.1.11], fixed in 2.12

## Description

CVE-2021-43299 was found in `pjsua_player_create` (OO wrapper - `AudioMediaPlayer::createPlayer`) which creates a file player and automatically adds this player to the conference bridge. 

Attackers that can remotely control the contents of the `filename` argument of `pjsua_player_create` may cause remote code execution.

This function contains a stack overflow vulnerability when `filename->ptr` is being copied to `path` without verifying that `filename->slen` (the filename size) is at most `path`’s allocated size which is `PJ_MAXPATH` (260). Therefore, passing a filename longer than 260 characters will cause a stack overflow.

## PoC

No PoC is supplied for this vulnerability.

## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading PJSIP to version 2.12.

## References

[(JFrog) 5 New Vulnerabilities Discovered in PJSIP Open Source Library](https://jfrog.com/blog/jfrog-discloses-5-memory-corruption-vulnerabilities-in-pjsip-a-popular-multimedia-library/)
[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43299)