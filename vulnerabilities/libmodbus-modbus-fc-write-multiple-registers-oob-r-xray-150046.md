---
description: CVE-2019-14463 Critical severity. Insufficient input validation in the libmodbus library allows unprivileged local network attackers to cause data leakage by sending simple crafted packets.
title: libmodbus MODBUS_FC_WRITE_MULTIPLE_REGISTERS OOB-R
date_published: "2019-07-31"
last_updated: "2019-07-31"
xray_id: XRAY-150046
vul_id: CVE-2019-14463
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

Attackers can trigger the exploit by invoking the [modbus_write_registers(3)](https://libmodbus.org/docs/v3.1.6/modbus_write_registers.html) function (which implements the Modbus [Write Multiple Registers](https://www.modbustools.com/modbus.html#function16) protocol call) while specifying a large number of registers to be written. Since the code takes this parameter from the network packet without checking it for validity against the length of the provided payload, the attackers can specify a large enough number to cause memory overwrites. Memory contents directly following the payload will be saved to Modbus register units. These contents can be later read out using the [modbus_read_registers()](https://libmodbus.org/docs/v3.1.6/modbus_read_registers.html) function. This results in a memory exfiltration vulnerability, exposing arbitrary memory contents.

The attacker must be on the same network segment as the target device, limiting the potential for this attack.

The library implementation of the `modbus_reply()` function of  module `src/modbus.c` module does not check properly that the number of registers/coils to be written corresponds to the the size of the provided payload data.

The original exploit was developed by JFrog researches, using smart fuzzing on the library compiled separately from the rest of the code. There is another CVE (CVE-2019-14462) for this library, for the `modbus_write_bits` function.

The official solution (see commits [1](https://github.com/stephane/libmodbus/commit/5ccdf5ef79d742640355d1132fa9e2abc7fbaefc) and [2](https://github.com/stephane/libmodbus/commit/6f915d4215c06be3c719761423d9b5e8aa3cb820)) fixes the bug by adding code to check for the correspondence between the number of the registers to be written and the data provided in the payload.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-14463)
