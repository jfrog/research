---
description: CVE-2021-42388 Medium severity. Heap OOB-R in ClickHouse leads to information leakage and denial of service
title: ClickHouse LZ4 OOB-R
date_published: "2022-03-15"
last_updated: "2022-03-15"
xray_id: XRAY-199962
vul_id: CVE-2021-42388
cvss: 7.1
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
A heap out-of-bounds read in ClickHouse can allow an authenticated network attacker to perform information leakage and denial of service



## Component

[ClickHouse](https://clickhouse.com/)



## Affected versions

ClickHouse (, 21.10.2.15), fixed in 21.10.2.15



## Description

A low-privileged authenticated network attacker can trigger this issue by sending crafted LZ4 data in a decompression request.

Accessing memory outside of the buffer’s bounds can expose sensitive information or lead in certain cases to a crash of the application due to segmentation fault.

As part of the `LZ4::decompressImpl() loop`, a 16-bit unsigned user-supplied value (`offset`) is read from the `compressed_data`. it is subtracted from the current op and stored in match pointer (op is a pointer that starts as dest and moves forward). There is no verification that the match pointer is not smaller than dest. Later, there’s a copy operation from match to output pointer - possibly copying out of bounds memory from before the `dest` memory buffer.

CVE-2021-42387 is a similar vulnerability to CVE-2021-42388, which exceeds the upper bounds of the compressed buffer (source) as part of the copy operation.



## PoC

No PoC is supplied for this issue



## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading ClickHouse to version 21.10.2.15.



## References

[(JFrog) Security Vulnerabilities Found in ClickHouse Open-Source Software](https://jfrog.com/blog/7-rce-and-dos-vulnerabilities-found-in-clickhouse-dbms)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-42388)