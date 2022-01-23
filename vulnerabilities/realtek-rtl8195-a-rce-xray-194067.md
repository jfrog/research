---
description: CVE-2020-25856 High severity. A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows authenticated attackers in wireless range to perform remote code execution by impersonating a Wi-Fi access point
title: Realtek RTL8195A RCE
date_published: "2021-02-03"
last_updated: "2021-02-03"
xray_id: XRAY-194067
vul_id: CVE-2020-25856
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
A stack buffer overflow in the Realtek RTL8195A Wi-Fi Module allows authenticated attackers in wireless range to perform remote code execution by impersonating a Wi-Fi access point

## Component

[Realtek Ameba SDK](https://www.amebaiot.com/en/ameba-sdk-summary/)

## Affected versions

Ameba SDK (, 2.0.8), fixed in 2.0.8

## Description

Realtek Wi-Fi chips enable connectivity for embedded devices and are widely used in IoT development boards and production devices. This vulnerability affects the RTL8195A module. Attackers can exploit the module by impersonating an Access Point (AP) and injecting a packet into the WPA2 handshake to cause a stack buffer overflow. The exploit can overwrite stack contents with a malicious payload, achieving remote code execution. No public exploit is currently known for this vulnerability, but the JFrog blog provides sufficient technical details for an attacker to replicate the exploit. The firmware employs no mitigations against memory corruption attacks, such as stack canaries, the NX bit, or ASLR protections, making this easier to exploit. Since this is a Wi-Fi attack, the attacker must be close enough for the target device to connect to the attacker's AP. The function `DecWPA2KeyData` in the Wi-Fi module's firmware does not validate the length parameter for an `rtl_memcpy` operation. The operation takes a length value provided on the network, and its destination is a fixed-size stack buffer. This results in stack buffer overflow with attacker-controlled contents.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/major-vulnerabilities-discovered-and-patched-in-realtek-rtl8195a-wi-fi-module/)
