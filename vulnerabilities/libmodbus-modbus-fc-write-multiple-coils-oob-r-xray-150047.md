---
description: CVE-2019-14462 Critical severity. Insufficient input validation in the libmodbus library allows unprivileged local network attackers to cause data leakage by sending simple crafted packets.
title: libmodbus MODBUS_FC_WRITE_MULTIPLE_COILS OOB-R
date_published: "2019-07-31"
last_updated: "2019-07-31"
xray_id: XRAY-150047
vul_id: CVE-2019-14462
cvss: 9.1
severity: critical
discovered_by: Maor Vermucht
type: vulnerability
---
## Summary

Insufficient input validation in the libmodbus library allows unprivileged local network attackers to cause data leakage by sending simple crafted packets.

## Component

[libmodbus](https://libmodbus.org/)

## Affected versions

libmodbus [3.0.0,3.0.7), fixed on 3.0.7

libmodbus [3.1.0,3.1.5), fixed on 3.1.5

## Description

[libmodbus](https://libmodbus.org/) is a C library that provides an implementation of the [Modbus](https://en.wikipedia.org/wiki/Modbus) protocol. It runs on Linux, Windows, FreeBSD, OS X, and QNX, and it is widely used in embedded devices.

Attackers can trigger the exploit by invoking the [modbus_write_bits(3)](https://libmodbus.org/docs/v3.1.6/modbus_write_bits.html) function (which implements the Modbus [Write Multiple Coils](https://www.modbustools.com/modbus.html#function15) protocol call) while specifying a large number of coils to be written. Since the code takes this parameter from the network packet without checking it for validity against the length of the provided payload, the attackers can specify a large enough number to cause memory overwrites. Memory contents directly following the payload will be saved to Modbus coils. These contents can be later read out using the [modbus_read_bits()](https://libmodbus.org/docs/v3.1.6/modbus_readbits.html) function. This results in a memory exfiltration vulnerability, exposing arbitrary memory contents.

The attacker must be on the same network segment as the target device, limiting the potential for this attack.

The library implementation of the `modbus_reply()` function of module `src/modbus.c` module does not properly check that the number of registers/coils to be written corresponds to the size of the provided payload data.

The original exploit was developed by JFrog researches, using smart fuzzing on the library compiled separately from the rest of the code. There is another CVE (CVE-2019-14463) for this library, for the `modbus_write_registers` function.

The official [solution](https://github.com/stephane/libmodbus/commit/5ccdf5ef79d742640355d1132fa9e2abc7fbaefc) fixes the bug by adding code to check for the correspondence between the number of the registers/coils to be written and the data provided in the payload.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-14462)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-14462)