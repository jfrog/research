---
description: CVE-2021-43298 Medium severity. A timing attack in GoAhead allows an attacker to perform authentication bypass on password-protected web pages
title: GoAhead timing attack auth bypass
date_published: "2022-01-01"
last_updated: "2022-01-01"
xray_id: XRAY-194044
vul_id: CVE-2021-43298
cvss: 5.3
severity: medium
discovered_by: Omer Kaspi
type: vulnerability
---
## Summary
A timing attack in GoAhead allows an attacker to perform authentication bypass on password-protected web pages

## Component

[GoAhead](https://www.embedthis.com/goahead/)

## Affected versions

(,5.1.3], fixed in 5.1.4

## Description

The code that performs password matching when using "Basic" HTTP authentication does not use a constant-time `memcmp`. Furthermore – by default there is no rate-limiting on the number of guesses allowed before blocking the attacking IP. This means that an unauthenticated network attacker can brute-force the HTTP basic password, byte-by-byte, by recording the webserver’s response time until the unauthorized (401) response.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43298)