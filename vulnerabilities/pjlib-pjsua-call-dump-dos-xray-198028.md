---
description: CVE-2021-43303 Medium severity. Buffer overflow in PJSUA leads to denial of service
title: PJLIB pjsua_call_dump DoS
date_published: "2022-03-01"
last_updated: "2022-03-01"
xray_id: XRAY-198028
vul_id: CVE-2021-43303
cvss: 5.9
severity: medium 
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Buffer overflow in PJSUA leads to denial of service when invoking `pjsua_call_dump` with malicious input.

## Component

[PJLIB](https://www.pjsip.org/pjlib/docs/html/)

## Affected versions

PJLIB (, 2.1.11], fixed in 2.12

## Description

CVE-2021-43303 is a buffer overflow vulnerability in `pjsua_call_dump` - a function that dumps call statistics to a given buffer:

Attackers that can remotely control the size of the `buffer` argument of `pjsua_call_dump` may cause a denial of service (specifically, the allocated buffer size needs to be smaller than 128 bytes).

The function uses the `tmp` variable in order to store the statistics temporarily and then copies it to the output argument `buffer` without validating that `maxlen` is at most `len` (which can be up to 128).
This can lead to a buffer overflow if the capacity of the given buffer parameter is smaller than `len`.

## PoC

No PoC is supplied for this vulnerability.

## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading PJSIP to version 2.12.

## References

[(JFrog) 5 New Vulnerabilities Discovered in PJSIP Open Source Library](https://jfrog.com/blog/jfrog-discloses-5-memory-corruption-vulnerabilities-in-pjsip-a-popular-multimedia-library/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43303)