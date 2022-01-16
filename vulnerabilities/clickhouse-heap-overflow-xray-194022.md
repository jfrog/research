---
title: ClickHouse heap overflow
date_published: "2021-10-09"
last_updated: "2021-10-09"
xray_id: XRAY-194022
vul_id: CVE-2021-37138
cvss: 8.8
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Heap overflow in ClickHouse can allow an authenticated network attacker to perform remote code execution

## Component

[Clickhouse](https://clickhouse.com/)

## Affected versions

(, v21.9.5.16-stable], fixed in v21.10.2.15-stable

## Description

There is no verification that the copy operations in the `LZ4::decompressImpl` loop and especially the arbitrary copy operation `wildCopy<copy_amount>(op, ip, copy_end)`, don’t exceed the destination buffer’s limits. Note that the lengths of the overflow, as well as source’s allocation size and the overflowing byte contents are fully controlled by the user. Also note that specifically this size check happens after the copy operation while the other copy operations aren’t covered at all.

A low-privileged authenticated network attacker can trigger this issue by sending crafted LZ4 data in a decompression request.

This issue is very similar to CVE-2021-37139, but the vulnerable copy operation is in a different `wildCopy` call.

## PoC

```bash
cat query.bin | curl -sS --data-binary @- 'http://serverIP:8123/?user=guest1&password=1234&decompress=1'
```

Get a crashing `query.bin` [here](https://jfrog.com/blog/TBDTBD)

## Vulnerability mitigations

If upgrading is not possible, add firewall rules in the server that will restrict the access to the web port (8123) and the TCP server’s port (9000) for only specific clients.

## References

[JFrog Blogpost](https://jfrog.com/blog/TBDTBD)
