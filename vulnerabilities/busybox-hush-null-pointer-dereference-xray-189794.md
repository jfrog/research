---
description: CVE-2021-42376 Medium severity. A NULL pointer dereference in Busybox hush leads to denial of service when processing malformed command line arguments
title: BusyBox hush NULL Pointer Dereference
date_published: "2021-11-09"
last_updated: "2021-11-09"
xray_id: XRAY-189794
vul_id: CVE-2021-42376
cvss: 5.5
severity: medium
discovered_by: Sharon Brizinov
type: vulnerability
---
## Summary
A NULL pointer dereference in Busybox hush leads to denial of service when processing malformed command line arguments

## Component

[BusyBox](https://busybox.net/)

## Affected versions

BusyBox [1.33.0, 1.33.1], fixed in 1.34.0

## Description

The [BusyBox](https://busybox.net/) toolkit implements a large number of Linux tools in a single executable and can even replace the Linux init system. Its small size and flexibility make it popular in embedded devices.

A NULL pointer dereference in `hush` leads to denial of service when processing a crafted shell command, due to missing validation after a `\x03` delimiter character. This may be used for DoS under very rare conditions of filtered command input.
An attacker that controls `hush` command line arguments can trigger this issue.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/unboxing-busybox-14-new-vulnerabilities-uncovered-by-claroty-and-jfrog/)
