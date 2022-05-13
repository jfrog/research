---
description: CVE-2021-42375 Medium severity. An incorrect handling of a special element in Busybox ash leads to denial of service when processing malformed command line arguments
title: BusyBox ash DoS
date_published: "2021-11-09"
last_updated: "2021-11-09"
xray_id: XRAY-189473
vul_id: CVE-2021-42375
cvss: 5.5
severity: medium
discovered_by: JFrog Collab
type: vulnerability
---
## Summary
An incorrect handling of a special element in Busybox ash leads to denial of service when processing malformed command line arguments

## Component

[BusyBox](https://busybox.net/)

## Affected versions

BusyBox [1.33.0, 1.33.1], fixed in 1.34.0

## Description

The [BusyBox](https://busybox.net/) toolkit implements a large number of Linux tools in a single executable and can even replace the Linux init system. Its small size and flexibility make it popular in embedded devices.

An incorrect handling of a special element in `ash` leads to denial of service when processing a crafted shell command, due to the shell mistaking specific characters for reserved characters. This may be used for DoS under rare conditions of filtered command input.
An attacker that controls `ash` command line arguments can trigger this issue.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) Unboxing BusyBox - 14 new vulnerabilities uncovered by Claroty and JFrog ](https://jfrog.com/blog/unboxing-busybox-14-new-vulnerabilities-uncovered-by-claroty-and-jfrog/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-42375)