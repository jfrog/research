---
description: CVE-2021-31227 High severity. A heap buffer overflow exists in NicheStack in the code that parses the HTTP POST request due to an incorrect signed integer comparison
title: NicheStack HTTP server DoS
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194049
vul_id: CVE-2021-31227
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
A heap buffer overflow exists in NicheStack in the code that parses the HTTP POST request due to an incorrect signed integer comparison

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

An issue was discovered in HCC embedded InterNiche 4.0.1. A potential heap buffer overflow exists in the code that parses the HTTP POST request, due to an incorrect signed integer comparison. This vulnerability requires the attacker to send a malformed HTTP packet with a negative `Content-Length`, which bypasses the size checks and results in a large heap overflow in the `wbs_multidata` buffer copy.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If not needed, disable the NicheStack HTTP server through the NicheStack CLI

## References

[(JFrog) INFRA:HALT New Vulnerabilities Impacting OT and Critical Infrastructure](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-31227)