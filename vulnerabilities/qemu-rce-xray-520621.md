---
description: CVE-2023-1601 Medium severity. A heap overflow in QEMU can allow an authenticated network attacker to perform a VM escape
title: QEMU Heap overflow VM escape
date_published: "2023-05-23"
last_updated: "2023-05-23"
xray_id: XRAY-520621
vul_id: CVE-2023-1601
cvss: 7.5
severity: medium
discovered_by: Yair Mizrahi
type: vulnerability
---
## Summary
A heap overflow in QEMU can allow an authenticated network attacker to perform a VM escape

## Component

[QEMU](https://www.qemu.org/)

## Affected versions

QEMU (,8.0.0], no fixed release

## Description

The fix for CVE-2021-4206 integer overflow was incomplete.
The `ui/cursor.c` function `cursor_alloc()` has a buffer size calculation before allocation:
```
size_t datasize = width * height * sizeof(uint32_t);
```

`width` and `height` are signed integers, but their product is cast to a `size_t` (unsigned integer) type.
`datasize` could then become 0 or a very small number by using very big negative numbers, which would also bypass the sanity check: `if (width > 512 || height > 512)`.

This could potentially lead to heap buffer overflow.
A malicious privileged guest user could exploit this flaw to crash the QEMU process or execute arbitrary code on the host in the context of the QEMU process.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[Advisory](https://access.redhat.com/security/cve/CVE-2023-1601)

## Credit

Discovered and reported by Yair Mizrahi of the JFrog security research team