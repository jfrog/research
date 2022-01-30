---
description: CVE-2021-42374 Medium severity. A OOB heap read in Busybox lzma leads to data leakage and denial of service when decompressing a malformed LZMA-based archive
title: BusyBox LZMA OOB-R
date_published: "2021-11-09"
last_updated: "2021-11-09"
xray_id: XRAY-189472
vul_id: CVE-2021-42374
cvss: 5.3
severity: medium
discovered_by: JFrog Collab
type: vulnerability
---
## Summary
A OOB heap read in Busybox lzma leads to data leakage and denial of service when decompressing a malformed LZMA-based archive

## Component

[BusyBox](https://busybox.net/)

## Affected versions

BusyBox [1.33.0, 1.33.1], fixed in 1.34.0

## Description

The [BusyBox](https://busybox.net/) toolkit implements a large number of Linux tools in a single executable and can even replace the Linux init system. Its small size and flexibility make it popular in embedded devices.

An out-of-bounds heap read in `unlzma` leads to information leak and denial of service when crafted LZMA-compressed input is decompressed. This can be triggered by any applet/format that internally supports LZMA compression.
An attacker that can pass an LZMA-based archive to be decompressed, can cause data leakage and denial of service.
Note that the following applets all accept and decompress an LZMA-based archive:
`unlzma`, `tar`, `unzip`, `rpm`, `dpkg`, `man`

As shown in the [JFrog blogpost](https://jfrog.com/blog/unboxing-busybox-14-new-vulnerabilities-uncovered-by-claroty-and-jfrog/), the attack is most potent when the victim unzips a crafted zip archive, since there are no special requirements on the unzipped filename and the leaked data can be archived back into the original zip archive.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/unboxing-busybox-14-new-vulnerabilities-uncovered-by-claroty-and-jfrog/)
