---
title: ClickHouse LZ4 OOB-R
date_published: "2022-01-01"
last_updated: "2022-01-01"
xray_id: XRAY-194027
vul_id: CVE-2021-42387
cvss: 7.1
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary

Heap out-of-bounds read in ClickHouse LZ4 codec can allow an authenticated network attacker to perform denial of service or information leakage

## Component

[Clickhouse](https://clickhouse.com/)

## Affected versions

(, v21.9.5.16-stable], fixed in v21.10.2.15-stable

## Description

As part of the `LZ4::decompressImpl` loop, a 16-bit unsigned user-supplied value is read from the compressed data and used in a subsequent subtraction. There is no verification that the result of the subtraction is larger than a base pointer used as the source of a copy operation, leading to a heap overread.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If upgrading is not possible, add firewall rules in the server that will restrict the access to the web port (8123) and the TCP server’s port (9000) for only specific clients.

## References

[JFrog Blogpost](TBA)
