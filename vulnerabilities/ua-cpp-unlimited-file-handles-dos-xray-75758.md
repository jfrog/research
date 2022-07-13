---
description: Medium severity. The Unified Automation C++ based OPC UA Client Server SDK for Linux is susceptible to denial of service when a remote authenticated attacker opens a large amount of file descriptors
title: Unified Automation C++ based OPC UA Client Server SDK unlimited file descriptors
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75758
vul_id:
cvss:
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
The Unified Automation C++ based OPC UA Client Server SDK for Linux is susceptible to denial of service when a remote authenticated attacker opens a large amount of file descriptors
 ## Component
[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
​

## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
​
## Description

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html) is a SDK used to develop an OPC UA server in C++, Developed by the Unified Automation.

In the Unified Automation C++-based OPC UA Demo Server, there is an exported object named `readwrite.txt`, it contains a function called `Open()` which opens the file.
Whenever this function is called (with `mode`=1) it calls `fopen()` without checking if this file is already open.
Calling this function X times will result in X open file descriptors.
However, a limitation in Linux is set by default so that only 1024 files can be opened.
Since under Linux a socket is also a file, once the process reaches its limit it will not be able to accept new network connections.

There was no root cause analysis conducted on the SDK itself

## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

