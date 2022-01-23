---
description: CVE-2020-25857 High severity. A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows unauthenticated attackers in wireless range to cause denial of service by impersonating a Wi-Fi access point
title: Realtek RTL8195A DoS
date_published: "2021-02-03"
last_updated: "2021-02-03"
xray_id: XRAY-194066
vul_id: CVE-2020-25857
cvss: 7.5
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows unauthenticated attackers in wireless range to cause denial of service by impersonating a Wi-Fi access point

## Component

[Realtek Ameba SDK](https://www.amebaiot.com/en/ameba-sdk-summary/)

## Affected versions

Ameba SDK (, 2.0.8), fixed in 2.0.8

## Description

Realtek Wi-Fi chips enable connectivity for embedded devices and are widely used in IoT development boards and production devices. This vulnerability affects the RTL8195A module. Attackers can exploit the module by impersonating an Access Point (AP) and injecting a packet into the WPA2 handshake to cause a stack buffer overflow, crashing the device and causing denial of service. No public exploit is currently known for this vulnerability, but the JFrog blog provides sufficient technical details for an attacker to replicate the exploit. The firmware employs no mitigations against memory corruption attacks, such as stack canaries, the NX bit, or ASLR protections, making this easier to exploit. Since this is a Wi-Fi attack, the attacker must be close enough for the target device to connect to the attacker's AP. The function `ClientEAPOLKeyRecvd` in the Wi-Fi module's firmware does not validate the length parameter for an `rtl_memcpy` operation. The operation takes a length value provided on the network, and its the destination is a fixed-size stack buffer. This results in stack buffer overflow, but the attacker cannot control the overflowing source data, and so this can only be exploited to crash the device.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/major-vulnerabilities-discovered-and-patched-in-realtek-rtl8195a-wi-fi-module/)
