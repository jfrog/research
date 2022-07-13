---
description: Medium severity. The UaVariant::cloneTo() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to of out bounds read issue which can allow a remote authenticated attacker to perform denial of service.
title: Unified Automation C++ based OPC UA Client Server SDK out of bounds read
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75757
vul_id:
cvss:
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
The UaVariant::cloneTo() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to of out bounds read issue which can allow a remote authenticated attacker to perform denial of service.

## Component
[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
​

## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
​
## Description

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html) is a SDK used to develop an OPC UA server in C++, Developed by the Unified Automation.

There is a possible read out of bounds in `UaVariant::cloneTo()`:
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
There is an integer overflow here if `source->Value.Matrix.NoOfDimensions` is 0x40000000 or bigger. For example with the value 0x40000001 the allocated size will be 0x4. This function is called from `UaVariant::operator=()` which is called from `PubSubServer::DataSetDispatcherDataItemTargetVariable::DataSetDispatcherDataItemTargetVariable()`:
```cpp
    if ( valueRank >= 0 )
    {
      if ( valueRank && valueRank != 1 )
      {
        OpcUa_Variant_Initialize(&vVal);
        vVal.ArrayType = 2;
        vVal.Datatype = builtInType;
        UaInt32Array::UaInt32Array(&dimensions);
        LOBYTE(v39) = 15;
        UaInt32Array::create(&dimensions, valueRank);
        vVal.Value.Matrix.NoOfDimensions = valueRank;
        vVal.Value.Matrix.Dimensions = UaInt32Array::detach(&dimensions);
        UaVariant::operator=(&intialValue, &vVal);
```


## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

