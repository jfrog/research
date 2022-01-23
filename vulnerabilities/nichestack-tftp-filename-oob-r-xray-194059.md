---
description: CVE-2021-36762 High severity. NicheStack TFTP filename read out of bounds
title: NicheStack TFTP filename OOB-R
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194059
vul_id: CVE-2021-36762
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
NicheStack TFTP filename read out of bounds

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

An issue was discovered in HCC Embedded InterNiche NicheStack through 4.3. The `tfshnd():tftpsrv.c` TFTP packet processing function doesn't ensure that a filename is adequately '\0' terminated; therefore, a subsequent call to `strlen` for the filename might read out of bounds of the protocol packet buffer (if no '\0' byte exists within a reasonable range).

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If not needed, disable the NicheStack TFTP server through the NicheStack CLI

## References

[JFrog Blogpost](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)
