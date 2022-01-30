---
description: CVE-2021-42384 Medium severity. A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments
title: BusyBox awk handle_special UaF
date_published: "2021-11-09"
last_updated: "2021-11-09"
xray_id: XRAY-189481
vul_id: CVE-2021-42384
cvss: 7.2
severity: medium
discovered_by: JFrog Collab
type: vulnerability
---
## Summary
A use-after-free in Busybox awk leads to remote code execution when processing malformed command line arguments

## Component

[BusyBox](https://busybox.net/)

## Affected versions

BusyBox [1.33.0, 1.33.1], fixed in 1.34.0

## Description

The [BusyBox](https://busybox.net/) toolkit implements a large number of Linux tools in a single executable and can even replace the Linux init system. Its small size and flexibility make it popular in embedded devices.

A use-after-free in awk leads to denial of service and possibly code execution when processing a crafted awk pattern in the `handle_special` function.
An attacker that controls the `awk` pattern (through the command line argument) can trigger this issue.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](
