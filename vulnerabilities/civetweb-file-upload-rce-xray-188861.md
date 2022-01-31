---
description: CVE-2020-27304  critical severity. A path traversal in CivetWeb leads to remote code execution when an attacker uploads a maliciously-named file
title: CivetWeb file upload RCE
date_published: "2021-10-19"
last_updated: "2021-10-19"
xray_id: XRAY-188861
vul_id: CVE-2020-27304
cvss: 9.8
severity: critical
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
A path traversal in CivetWeb leads to remote code execution when an attacker uploads a maliciously-named file

## Component

[CivetWeb](https://github.com/civetweb/civetweb)

## Affected versions

CivetWeb [1,8,1.14], fixed in 1.15

## Description

[CivetWeb](https://github.com/civetweb/civetweb) is a very popular embeddable web server/library that can either be used standalone or by adding web server functionality to an existing application. CivetWeb prioritizes simplicity, customizability and performance. It can also be used by end users as a stand-alone web server running on a Windows or Linux PC.

A path traversal issue was discovered, when accepting unsanitized filenames as part of a file upload operation.

This issue only impacts CivetWeb-based web applications that use the built-in file upload form handler.
In technical terms, a CivetWeb-based web application is vulnerable if:

1. The application handles HTTP form data by calling CivetWeb’s
`mg_handle_form_request` and supplies the (mandatory) user-defined
`field_found` callback function

2. The `field_found` callback function returns `MG_FORM_FIELD_STORAGE_STORE` to indicate a file upload operation

3. The `field_found` callback function supplies the (mandatory) `path` output argument, where the path relies on the `filename` input argument (which comes directly from the HTTP form data)

Note that this scenario is the standard way of using CivetWeb’s file upload functionality, and is supplied as a full working example in the [embedded_c](https://github.com/civetweb/civetweb/blob/0a39165041fd3f060187914e869eeaa78f864d0f/examples/embedded_c/embedded_c.c) example in the CivetWeb sources.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

Use a WAF to filter HTTP form file upload requests that contain the string `..` in the `filename` form parameter

## References

[JFrog Blogpost](https://jfrog.com/blog/cve-2020-27304-rce-via-directory-traversal-in-civetweb-http-server/)
