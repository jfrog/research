---
description: CVE-2020-13697 High severity. An attacker can run malicious JavaScript code due to an XSS in the *GeneralHandler* GET handler.
title: XSS in NanoHTTPD
date_published: "2021-02-23"
last_updated: "2021-02-23"
xray_id: XRAY-141192
vul_id: CVE-2020-13697
cvss: 6.1
severity: high
discovered_by: Andrey Polkovnychenko
type: vulnerability
---
## Summary
An attacker can run malicious JavaScript code due to an XSS in the *GeneralHandler* GET handler.

## Component

[NanoHTTPD](https://github.com/NanoHttpd/nanohttpd)

## Affected versions

NanoHTTPD (,2.3.1), fixed in [2.3.2]

## Description

An issue was discovered in RouterNanoHTTPD.java in NanoHTTPD through 2.3.1. The `GeneralHandler` class implements a basic GET handler that prints debug information as an HTML page. Any web server that extends this class without implementing its own GET handler is vulnerable to reflected XSS, because the `GeneralHandler` GET handler prints user input passed through the query string without any sanitization.

## PoC

`http://vulnerable.com?a=<script>alert("XSS!");</script>`



## Vulnerability Mitigations

Implement a different general GET handler that does not use user-input

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2020-13697)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2020-13697)