---
description: Medium severity. The UaVariant::cloneTo() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to NULL dereference which can allow a remote authenticated attacker to perform denial of service.
title: Unified Automation C++ based OPC UA Client Server SDK out of bounds read
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75756
vul_id:
cvss:
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
The UaVariant::cloneTo() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to NULL dereference which can allow a remote authenticated attacker to perform denial of service.
## Component

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
​

## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
​
## Description

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html) is a SDK used to develop an OPC UA server in C++, Developed by the Unified Automation.

There is a possible null deref in `UaVariant::cloneTo()`:
```cpp
…
      if ( source->Value.Matrix.NoOfDimensions > 0 )
      {
        copy->Value.Matrix.Dimensions = (int *)OpcUa_Memory_Alloc(4 * source->Value.Matrix.NoOfDimensions);
        memcpy(copy->Value.Matrix.Dimensions, source->Value.Matrix.Dimensions, 4 * source->Value.Matrix.NoOfDimensions);
        nMatrixElements = 1;
        for ( mm = 0; mm < copy->Value.Matrix.NoOfDimensions; ++mm )
          nMatrixElements *= source->Value.Matrix.Dimensions[mm];
…
```
There is a call to `memcpy()` after `OpcUa_Memory_Alloc()` is called without checking if `copy->Value.Matrix.Dimensions` is null. It might be null if the requested length is too big.



## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

