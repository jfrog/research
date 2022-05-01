---
description: CVE-2021-42373 Medium severity. BusyBox man Section Name Handling NULL Pointer Dereference Local DoS
title: BusyBox man NULL Pointer Dereference
date_published: "2021-11-09"
last_updated: "2021-11-09"
xray_id: XRAY-189471
vul_id: CVE-2021-42373
cvss: 5.5
severity: medium
discovered_by: JFrog Collab
type: vulnerability
---
## Summary
BusyBox man Section Name Handling NULL Pointer Dereference Local DoS

## Component

[BusyBox](https://busybox.net/)

## Affected versions

BusyBox [1.33.0, 1.33.1], fixed in 1.34.0

## Description

The [BusyBox](https://busybox.net/) toolkit implements a large number of Linux tools in a single executable and can even replace the Linux init system. Its small size and flexibility make it popular in embedded devices.

A NULL pointer dereference was found in the `man` applet, which leads to denial of service when a section name is supplied but no page argument is given.
An attacker that controls `man` command line arguments can trigger this issue.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) Unboxing BusyBox - 14 new vulnerabilities uncovered by Claroty and JFrog ](https://jfrog.com/blog/unboxing-busybox-14-new-vulnerabilities-uncovered-by-claroty-and-jfrog/)