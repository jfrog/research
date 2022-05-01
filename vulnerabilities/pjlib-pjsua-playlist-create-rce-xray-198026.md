---
description: CVE-2021-43301 High severity. Stack overflow in PJSUA leads to remote code execution
title: PJLIB pjsua_playlist_create RCE
date_published: "2022-03-01"
last_updated: "2022-03-01"
xray_id: XRAY-198026
vul_id: CVE-2021-43301
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Stack overflow in PJLIB leads to remote code execution when invoking `pjsua_playlist_create` with malicious input

## Component

[PJLIB](https://www.pjsip.org/pjlib/docs/html/)

## Affected versions

PJLIB (, 2.1.11], fixed in 2.12

## Description

CVE-2021-43301 was found in `pjsua_playlist_create` (OO wrapper - `AudioMediaPlayer::createPlaylist`)  which creates a file playlist media port and automatically adds the port to the conference bridge.

Attackers that can remotely control the contents of the `file_names` argument of `pjsua_player_create` may cause remote code execution.

This function contains a stack overflow vulnerability when the child function `pjmedia_wav_playlist_create` is called. This function copies each file name from `file_list` to `filename` without checking if its length is at most `PJ_MAXPATH` (260). If the file name length is longer - the copy will overflow the filename variable and trigger a stack overflow.

## PoC

No PoC is supplied for this vulnerability.

## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading PJSIP to version 2.12.

## References

[(JFrog) 5 New Vulnerabilities Discovered in PJSIP Open Source Library](https://jfrog.com/blog/jfrog-discloses-5-memory-corruption-vulnerabilities-in-pjsip-a-popular-multimedia-library/)