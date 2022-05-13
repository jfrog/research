---
description: CVE-2020-25860 Medium severity. ToCToU in Pengutronix RAUC allows attackers to bypass signature verification
title: Pengutronix RAUC signature bypass
date_published: "2020-12-21"
last_updated: "2020-12-21"
xray_id: XRAY-194062
vul_id: CVE-2020-25860
cvss: 6.6
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
ToCToU in Pengutronix RAUC allows attackers to bypass signature verification

## Component

[Pengutronix RAUC](https://rauc.readthedocs.io/en/latest/index.html)

## Affected versions

RAUC (, 1.5), fixed in 1.5

## Description

The [Pengutronix RAUC](https://rauc.readthedocs.io/en/latest/index.html) ("Robust Auto-Update Controller") is an open-source update client intended for Linux-based embedded devices, with support for many types of common bootloaders and filesystems.

Attackers can modify the update file during the installation process to make RAUC install an arbitrary, unverified payload. The attackers have to modify the update file to exploit the vulnerability, so they must either run code on the device with permissions to modify the file or have physical access to the storage. If RAUC accepts updates from the network, stores them in a single location, and is configured not to prevent repeated uploads while an installation is in progress, the vulnerability can be exploited remotely. The example CGI interface provided by RAUC does not allow repeated uploads.

The RAUC function `check_bundle()` in module `install.c` uses OpenSSL to verify the file's signature, but it then closes the bundle file and does not retain its contents in any way. Another function, `mount_bundle()`, is then called to extract the contents of the update image. This function opens the file with a new sub-process and rereads its content from storage, making a time-of-check to time-of-use attack possible, since the attacker can replace or modify the update file in the period of time before the invocation of `mount_bundle()`.

The vulnerability was discovered by JFrog researchers.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) Vulnerability Discovered in RAUC Embedded Firmware Update](https://jfrog.com/blog/cve-2020-25860-significant-vulnerability-discovered-in-rauc-embedded-firmware-update-framework/)
[NVD](https://nvd.nist.gov/vuln/detail/CVE-2020-25860)