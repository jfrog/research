---
description: CVE-2022-29863 High severity. A memory exhaustion issue in UA .NET Standard can allow a remote attacker to perform denial of service
title: UA .NET Standard memory exhaustion DoS
date_published: "2022-06-16"
last_updated: "2022-06-16"
xray_id: XRAY-229142
vul_id: CVE-2022-29863
cvss: 7.5
severity: high
discovered_by: Uriya Yavniely
type: vulnerability
---
## Summary
A memory exhaustion issue in UA .NET Standard and UA .NET Legacy can allow a remote attacker to perform denial of service
​

## Component

[UA .NET Standard](https://github.com/OPCFoundation/UA-.NETStandard)

[UA .NET Legacy](https://github.com/OPCFoundation/UA-.NET-Legacy)
​

## Affected versions

UA .NET Standard (, 1.4.368.53], fixed in 1.4.368.58
UA .NET Legacy all released versions are affected. Fixed in commit 35199e43d46f0eef793cace12baa806838ddba2c
​
## Description

[UA .NET Standard](https://github.com/OPCFoundation/UA-.NETStandard) is an implementation of an OPC UA server in C#, provided by the OPC Foundation.

In the binary decoder when parsing an array, a 32 bit length field is being read, then an array of the matching type is being allocated.
In some cases this behavior might lead to a denial of service.

A nested variant array where each element is also a nested array that has a length field set to a large number might in certain cases lead to an Exception of OutOfMemoryException.
That’s because for each nested array `BinaryDecoder.cs::ReadArrayElements()` will try to allocate sizeof(Variant) * length and then read the first variant element, but because the first variant element is also an array it will call to ReadArrayElements().
Parsing that array will behave exactly as the containing array, it will allocate an array in size of the specified length and call ReadVariant() and so on.
That will lead eventually to an allocation of nesting level * length * sizeof(Variant).

As the parsing process will continue, the garbage collector will be required to free up some space but it will fail, so it will be kept calling on and on while stealing running time to the other threads.
Eventually the server will fail to answer requests in time.

This issue is also exists in [UA .NET Legacy](https://github.com/OPCFoundation/UA-.NET-Legacy), the previous implementation of the OPC UA server in C#.

## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

[UA .NET Standard advisory](https://files.opcfoundation.org/SecurityBulletins/OPC%20Foundation%20Security%20Bulletin%20CVE-2022-29863.pdf)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-29863)