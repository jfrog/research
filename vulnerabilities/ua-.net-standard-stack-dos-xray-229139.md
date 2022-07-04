---
description: CVE-2022-29866 High severity. A stack exhaustion issue in UA .NET Standard can allow a remote attacker to perform denial of service
title: UA .NET Standard stack exhaustion DoS
date_published: "2022-06-16"
last_updated: "2022-06-16"
xray_id: XRAY-229139
vul_id: CVE-2022-29866
cvss: 7.5
severity: high
discovered_by: Uriya Yavniely
type: vulnerability
---
## Summary
A stack exhaustion issue in UA .NET Standard can allow a remote attacker to perform denial of service
​

## Component

[UA .NET Standard](https://github.com/OPCFoundation/UA-.NETStandard)
​

## Affected versions

UA .NET Standard (, 1.4.368.53], fixed in 1.4.368.58
​
## Description

[UA .NET Standard](https://github.com/OPCFoundation/UA-.NETStandard) is an implementation of an OPC UA server in C#, provided by the OPC Foundation.


One of the OPC-UA requests is [TranslateBrowsePathsToNodeId](https://reference.opcfoundation.org/v104/Core/docs/Part4/5.8.4/).
This request provides browse paths, each of which contains a starting node and a relative path from that node to a target node.
The server will resolve each browse path and return a response that contains a target node id for each browse path.
However, when handling that request there is a recursion in `MasterNodeManager.cs::TranslateBrowsePath()` that walks through the relative path's elements.
Providing too many elements will make that function go beyond the maximum recursion level and crash the server due to StackOverflowException.

In order to provide enough elements in the relative path the attacker doesn't necessary require a long relative path.
Each element has a field called `isInverse` which makes the path resolver go backward instead of forward.
So a relative path that contains only two elements with back and forth path can also be long enough to crash the server.

This issue exists only in the HTTPS endpoint and not in the TCP endpoint.
That is because creating enough elements requires sending a lot of data and the TCP endpoint by default limits the request's data to 64KB.
The HTTPS endpoint doesn't have such limit, which makes it vulnerable to this issue.


## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

[UA .NET Standard advisory](https://files.opcfoundation.org/SecurityBulletins/OPC%20Foundation%20Security%20Bulletin%20CVE-2022-29866.pdf)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-29866)