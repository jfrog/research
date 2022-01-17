---
title: Realtek 8710 WPA2 stack overflow
date_published: "2021-06-02"
last_updated: "2021-06-02"
xray_id: XRAY-194060
vul_id: CVE-2020-27301
cvss: 8.0
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
Stack overflow in Realtek 8710 WPA2 key parsing leads to remote code execution

## Component

[Realtek Ameba SDK](https://www.amebaiot.com/en/ameba-sdk-summary/)

## Affected versions

Ameba SDK (, 7.1d), fixed in 7.1d

## Description

A stack buffer overflow in Realtek RTL8710 (and other Ameba-based devices) can lead to remote code execution via the `AES_UnWRAP` function, when an attacker in Wi-Fi range sends a crafted "Encrypted GTK" value as part of the WPA2 4-way-handshake.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/revisiting-realtek-a-new-set-of-critical-wi-fi-vulnerabilities-discovered-by-automated-zero-day-analysis/)
