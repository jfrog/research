---
title: InterNiche DNS client heap overflow
date_published: "2021-08-04"
last_updated: "2021-08-04"
xray_id: XRAY-194045
vul_id: CVE-2020-25928
cvss: 9.8
severity: critical
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
Heap overflow in InterNiche TCP/IP stack's DNS client leads to remote code execution when sending a crafted DNS response

## Component

[InterNiche TCP/IP stack](https://www.hcc-embedded.com/products/networking/tcpip-applications)

## Affected versions

InterNiche (, 4.3), fixed in 4.3

## Description

NicheStack (also known as InterNiche stack) is a proprietary TCP/IP stack developed originally by InterNiche Technologies and acquired by HCC Embedded in 2016. A heap-based buffer overflow was discovered when the NicheStack DNS client parses DNS response packets. To trigger CVE-2020-25928, an attacker sends a crafted DNS packet as a response to a DNS query from the vulnerable device. A response with a big "response data length" field will cause a heap overflow due to a fixed-size heap buffer copy. This is easy to achieve because the DNS TXID and UDP source port can be guessed due to CVE-2020-25926 and CVE-2021-31228, respectively, and the affected DNS client implementation does not validate the source IP address of the response packet (so the attacker does not even need to know the address of the real DNS server). Note that the DNS client is optional, and may be disabled or compiled-out entirely.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

If not needed, disable the NicheStack DNS client through the NicheStack CLI

## References

[JFrog Blogpost](https://jfrog.com/blog/infrahalt-14-new-security-vulnerabilities-found-in-nichestack/)
