---
description: CVE-2021-43304 High severity. Heap overflow in ClickHouse leads to remote code execution
title: ClickHouse LZ4 RCE	
date_published: "2022-03-15"
last_updated: "2022-03-15"
xray_id: XRAY-199961
vul_id: CVE-2021-43304
cvss: 8.8
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
A heap overflow in ClickHouse can allow an authenticated network attacker to perform remote code execution



## Component

[ClickHouse](https://clickhouse.com/)



## Affected versions

ClickHouse (, 21.10.2.15), fixed in 21.10.2.15



## Description

There is no verification that the copy operations in the `LZ4::decompressImpl` loop and especially the arbitrary copy operation `wildCopy<copy_amount>(op, ip, copy_end)`, don’t exceed the destination buffer’s limits. Note that the lengths of the overflow, as well as source’s allocation size and the overflowing byte contents are fully controlled by the user. Also note that specifically this size check happens after the copy operation while the other copy operations aren’t covered at all.

A low-privileged authenticated network attacker can trigger this issue by sending crafted LZ4 data in a decompression request.

This issue is very similar to CVE-2021-43305, but the vulnerable copy operation is in a different `wildCopy` call.



## PoC

More info in [JFrog's Blogpost](https://jfrog.com/blog/7-rce-and-dos-vulnerabilities-found-in-clickhouse-dbms) -

`00000000  26 fc 61 db c0 83 bb 0a  db 58 5a f0 34 e1 30 f6  |&.a......XZ.4.0.|`

`00000010  82 0a c8 00 00 01 00 00  00 f0 ff ff ff ff ff ff  |................|`

`00000020  ff ff ff ff ff ff ff ff  ff ff ff ff ff ff ff ff  |................|`

`*`

`000000e0  ff ff 41 41 41 41 41 41  41 41 41 41 41 41 41 41  |..AAAAAAAAAAAAAA|`

`000000f0  41 41 41 41 41 41 41 41  41 41 41 41 41 41 41 41  |AAAAAAAAAAAAAAAA|`

`*`

`0000c81a`



## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading ClickHouse to version 21.10.2.15.



## References

[(JFrog) Security Vulnerabilities Found in ClickHouse Open-Source Software](https://jfrog.com/blog/7-rce-and-dos-vulnerabilities-found-in-clickhouse-dbms)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-43304)