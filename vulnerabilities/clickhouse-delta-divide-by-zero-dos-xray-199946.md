---
description: CVE-2021-42389 Medium severity. Divide-by-zero in ClickHouse leads to denial of service
title: ClickHouse Divide-by-zero DoS
date_published: "2022-03-15"
last_updated: "2022-03-15"
xray_id: XRAY-199946
vul_id: CVE-2021-42389
cvss: 6.5
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
A divide-by-zero in ClickHouse's Delta compression codec can allow an authenticated network attacker to perform denial of service

## Component

[ClickHouse](https://clickhouse.com/)



## Affected versions

ClickHouse (, 21.10.2.15), fixed in 21.10.2.15



## Description

A low-privileged authenticated network attacker can trigger this issue by sending crafted compressed data to ClickHouse.
Triggering the issue will crash the ClickHouse process, causing denial of service.

The ClickHouse decompression code reads the first byte of the compressed buffer and performs a modulo operation with it to get the remainder:
```c
UInt8 bytes_size = source[0];
UInt8 bytes_to_skip = uncompressed_size % bytes_size;
```
In case `bytes_size` is 0, it will end up dividing by zero.



## PoC

No PoC is supplied for this issue



## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading ClickHouse to version 21.10.2.15.



## References

[(JFrog) Security Vulnerabilities Found in ClickHouse Open-Source Software](https://jfrog.com/blog/7-rce-and-dos-vulnerabilities-found-in-clickhouse-dbms)
[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-42389)