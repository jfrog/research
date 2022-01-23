---
description: CVE-2020-25853 High severity. A stack buffer over-read in the Realtek RTL8195A Wi-Fi Module allows unauthenticated attackers in wireless range to cause denial of service by impersonating a Wi-Fi access point
title: Realtek RTL8195A RCE
date_published: "2021-02-03"
last_updated: "2021-02-03"
xray_id: XRAY-194070
vul_id: CVE-2020-25853
cvss: 7.5
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
A stack buffer over-read in the Realtek RTL8195A Wi-Fi Module allows unauthenticated attackers in wireless range to cause denial of service by impersonating a Wi-Fi access point

## Component

[Realtek Ameba SDK](https://www.amebaiot.com/en/ameba-sdk-summary/)

## Affected versions

Ameba SDK (, 2.0.8), fixed in 2.0.8

## Description

Realtek Wi-Fi chips enable connectivity for embedded devices and are widely used in IoT development boards and production devices. This vulnerability affects the RTL8195A module. Attackers can exploit the module by impersonating an Access Point (AP) and injecting a packet into the WPA2 handshake to cause a stack buffer over-read, crashing the device and causing denial of service. No public exploit is currently known for this vulnerability, but the JFrog blog provides sufficient technical details for a skilled attacker to replicate the exploit. Since this is a Wi-Fi attack, the attacker must be close enough for the target device to connect to the attacker's AP. The function `CheckMic` in the module's firmware does not validate a size parameter received on the network before passing it to one of two internal functions, `_rt_md5_hmac_veneer` or `_rt_hmac_sha1_veneer`, depending on the access point's HMAC algorithm. These functions will then execute a read out of bounds, crashing the module.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/major-vulnerabilities-discovered-and-patched-in-realtek-rtl8195a-wi-fi-module/)
