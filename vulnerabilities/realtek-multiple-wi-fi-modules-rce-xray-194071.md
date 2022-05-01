---
description: CVE-2020-9395 High severity. A stack buffer overflow in Realtek Wi-Fi modules allows attackers in wireless range to perform arbitrary code execution by impersonating a Wi-Fi access point
title: Realtek multiple Wi-Fi modules RCE
date_published: "2021-02-03"
last_updated: "2021-02-03"
xray_id: XRAY-194071
vul_id: CVE-2020-9395
cvss: 8.0
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
A stack buffer overflow in Realtek Wi-Fi modules allows attackers in wireless range to perform arbitrary code execution by impersonating a Wi-Fi access point

## Component

[Realtek Ameba SDK](https://www.amebaiot.com/en/ameba-sdk-summary/)

## Affected versions

Ameba SDK (, 2.0.8), fixed in 2.0.8

## Description

Realtek Wi-Fi chips enable connectivity for embedded devices and are widely used in IoT development boards and production devices. Code running on the Realtek SoC handles some of the logic, including the handling for cryptographic keys. This vulnerability affects the RTL8195AM, RTL8711AM, RTL8711AF, and RTL8710AF modules. Attackers who know the correct password for the Wi-Fi network can exploit the modules by impersonating the Access Point (AP) and injecting a packet to cause a stack buffer overflow. The exploit can simply crash the device, causing denial of service, or attackers can also craft a packet which decrypts to an executable code payload, achieving arbitrary code execution. The firmware employs no mitigations against memory corruption attacks, such as stack canaries, the NX bit, or ASLR protections. Since this is a Wi-Fi attack, the attacker must be close enough to the attacked device to connect to their AP. The `DecWPA2KeyData` function in the module's firmware calls one of two vulnerable functions, depending on the access point's encryption algorithm: `_rt_arc4_crypt_veneer` or `_AES_UnWRAP_veneer`. Both functions decrypt a key buffer received from the AP and place the results into a fixed-size buffer on the stack without checking the actual buffer length. Since the attacker who impersonates the AP can craft an EAPOL-Key response packet with the key buffer's contents and length of their choice, they can cause stack buffer overflow. An attacker who knows the network's password can also compute the KEK (Key Encryption Key), which is derived from the Wi-Fi password. This allows the attacker to correctly encrypt a binary buffer using the KEK and pass the results in the key buffer, causing the device to decrypt it and overwrite its stack with attacker-controlled contents. This leads to malicious code execution. The original exploit was discovered by the JFrog Research Team. The fix adds an output length parameter to the vulnerable functions and verifies it against the maximum length of the key buffer.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) WiFi Vulnerabilities Discovered by Automated Zero-Day Analysis](https://jfrog.com/blog/major-vulnerabilities-discovered-and-patched-in-realtek-rtl8195a-wi-fi-module/)