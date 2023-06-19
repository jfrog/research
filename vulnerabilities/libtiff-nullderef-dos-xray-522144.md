---
description: CVE-2023-3316, MEDIUM, A NULL pointer dereference in TIFFClose() is caused by a failure to open an output file (non-existent path or a path that requires permissions like /dev/null) while specifying zones.
title: libtiff NULL dereference DoS
date_published: "2023-06-19"
last_updated: "2023-06-19"
xray_id: XRAY-522144
vul_id: CVE-2023-3316
cvss: 5.9
severity: medium
discovered_by: Yair Mizrahi
type: vulnerability

---

## Summary

A NULL pointer dereference in TIFFClose() is caused by a failure to open an output file (non-existent path or a path that requires permissions like /dev/null) while specifying zones.

## Component

libtiff:libtiff

## Affected versions

[3.9.0,4.5.1)

## Description

A NULL pointer dereference in TIFFClose() is caused by a failure to open an output file (non-existent path or a path that requires permissions like /dev/null) while specifying zones.

## PoC

```bash
$ git clone https://gitlab.com/libtiff/libtiff.git
$ cd libtiff/
$ ./autogen.sh
$ ./configure && make
$ tools/tiffcrop -Z 1:1 empty.tif /non-existent-path
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Advisory](https://gitlab.com/libtiff/libtiff/-/issues/515)

