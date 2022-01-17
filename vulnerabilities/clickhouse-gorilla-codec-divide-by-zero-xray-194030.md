---
title: ClickHouse Gorilla codec divide-by-zero
date_published: "2022-01-01"
last_updated: "2022-01-01"
xray_id: XRAY-194030
vul_id: CVE-2021-42391
cvss: 6.5
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Divide-by-zero in ClickHouse Gorilla codec can allow an authenticated attacker to perform denial of service

## Component

[Clickhouse](https://clickhouse.com/)

## Affected versions

(, v21.9.5.16-stable], fixed in v21.10.2.15-stable

## Description

The first byte of the compressed query buffer is used as a divisor in a modulo operation. By sending a compressed query with the first byte set to zero, an authenticated attacker can cause a denial of service

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If upgrading is not possible, add firewall rules in the server that will restrict the access to the web port (8123) and the TCP server’s port (9000) for only specific clients.

## References

[JFrog Blogpost](TBA)
